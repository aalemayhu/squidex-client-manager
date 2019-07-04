const fs = require('fs');

// The API is generated from the swagger-js module
const Swagger = require('swagger-client');
const FormData = require('form-data');

const { SquidexTokenManager } = require('./token_manager');
const { buildFilterString } = require('./filter');
const { Log } = require('./logger');

/**
 * Check response status is correct
 * @param {the HTTP response} response
 * @param {the expected status code} status
 */
function ensureValidResponse(response, status) {
  if (response.status !== status) {
    Log.Debug(`expected response status ${status} but received ${response.status}`);
    throw new Error(`Status code is not OK (${status}) but ${response.status}`);
  }
}

/**
 * Check that a value is set or throw error
 * @param {the argument to be checked} argument
 */
function ensureValidArg(argument) {
  if (argument === undefined) {
    const name = Object.keys({ argument })[0];
    return new Error(`expected argument ${name} is undefined`);
  }
  return null;
}


/**
 * SquidexClientManager is Javascript wrapper around the Squidex API provided via Swagger.
 * The implementation relies on the swagger-js generation of the API.
 *
 */
class SquidexClientManager {
  constructor(url, appName, id, secret) {
    ensureValidArg(url); ensureValidArg(id); ensureValidArg(secret);
    this.connectUrl = `${url}/identity-server/connect/token`;
    this.projectSpecUrl = `${url}/api/content/${appName}/swagger/v1/swagger.json`;
    this.squidexSpecUrl = `${url}/api/swagger/v1/swagger.json`;
    this.appName = appName;
    this.tokenManager = new SquidexTokenManager(
      this.connectUrl, id, secret, process.env.DEBUG_TOKEN_CACHE,
    );
  }

  /**
   * Handle token checking and renew if invalid. This function should be called before any
   * API calls and is handled transparently by the squidex client manager instance.
   */
  async ensureValidClient() {
    // Make sure we have a valid token before proceeding
    if (this.squidexApi && this.client && this.tokenManager.isTokenValid()) {
      return;
    }

    const token = await this.tokenManager.getToken();
    // This client is for our project API
    this.client = await new Swagger({
      url: this.projectSpecUrl,
      requestInterceptor: (req) => {
        if (req.body && !req.headers['Content-Type']) {
          req.headers['Content-Type'] = 'application/json';
        }
        req.headers.Authorization = `Bearer ${token}`;
      },
    });
    // The squidexApi client gives us access to the general API's like asset
    this.squidexApi = await new Swagger({
      url: this.squidexSpecUrl,
      requestInterceptor: (req) => {
        if (req.body && !req.headers['Content-Type']) {
          req.headers['Content-Type'] = 'application/json';
        }
        req.headers.Authorization = `Bearer ${token}`;
      },
    });
  }

  /**
   * Return list of the API endpoints available, there should be one for each model.
   */
  Models() {
    return this.client.apis;
  }

  /**
   * Lookup the endpoint in the apis available
   * @param {the CMS model name} name
   */
  GetModelByName(name) {
    Log.Debug(`GetModelByName(${name})`);
    // Find the API endpoint
    const models = this.Models();
    const model = models[name];
    if (!model) {
      throw new Error(`Unknown model name ${model}`);
    }
    return model;
  }

  /**
   * Retrieve the items for the model
   * @param {the schema name} modelName
   * @param {the query options} opts
   */
  async RecordsAsync(modelName, opts) {
    await this.ensureValidClient();
    Log.Debug(`Records(${modelName}, ${opts})`);
    const model = this.GetModelByName(modelName);
    // Query the contents of the endpoint
    const payload = await model[`Query${modelName}Contents`](opts);
    ensureValidResponse(payload, 200);
    return JSON.parse(payload.data);
  }

  /**
   * Get a record content
   * @param {the API endpoint} modelName
   * @param {object containing the id property} payload
   */
  async RecordAsync(modelName, payload) {
    await this.ensureValidClient();
    Log.Debug(`Record(${modelName}, ${payload})`);
    const model = this.GetModelByName(modelName);
    const response = await model[`Get${modelName}Content`](payload);
    /**
     * 200 OK
     * The standard response for successful HTTP requests.
     */
    ensureValidResponse(response, 200);
    return response.obj.data;
  }

  /**
   * Create a record content
   * @param {the API endpoint} modelName
   * @param {the object representing what to create} payload
   */
  async CreateAsync(modelName, payload) {
    await this.ensureValidClient();
    Log.Debug(`Create(${modelName}, ${payload})`);
    const model = this.GetModelByName(modelName);
    const response = await model[`Create${modelName}Content`](payload);
    // 201 means Created:
    // The request has been fulfilled and a new resource has been created.
    ensureValidResponse(response, 201);
    return JSON.parse(response.data);
  }

  /**
   * Delete a record content
   * @param {the API endpoint} modelName
   * @param {the object containing the id property} payload
   */
  async DeleteAsync(modelName, payload) {
    await this.ensureValidClient();
    Log.Debug(`Delete(${modelName}, ${payload})`);
    const model = this.GetModelByName(modelName);
    const response = await model[`Delete${modelName}Content`](payload);
    // 204 No content
    // The server accepted the request but is not returning any content.
    // This is often used as a response to a DELETE request.
    ensureValidResponse(response, 204);
    return response;
  }

  /**
   * Update a record content
   * @param {the API endpoint} modelName
   * @param {the object containing the id property} payload
   */
  async UpdateAsync(modelName, payload) {
    await this.ensureValidClient();
    Log.Debug(`Update(${modelName}, ${payload})`);
    const model = this.GetModelByName(modelName);
    const response = await model[`Update${modelName}Content`](payload);
    /**
     * 200 OK
     * The standard response for successful HTTP requests.
     */
    ensureValidResponse(response, 200);
    return response.obj;
  }

  /**
   * Retrieve one item
   * @param {the API endpoint} name
   * @param {the field for the filter} identifier
   * @param {the unique filter value} value
   */
  async FindOne(name, identifier, value) {
    await this.ensureValidClient();
    const filter = buildFilterString(`data/${identifier}/iv`, 'eq', value);
    const records = await this.RecordsAsync(name, {
      $filter: filter,
      $top: 1,
    });
    return records.items[0];
  }

  /**
   * Filter record contents
   * @param {the API endpoint} name
   * @param {the object to use for filtering} payload
   * @param {the filter field name} fieldName
   */
  async FilterRecordsAsync(name, payload, fieldName) {
    await this.ensureValidClient();
    const uniqueValue = payload.data[`${fieldName}`].iv;
    const filter = buildFilterString(`data/${fieldName}/iv`, 'eq', uniqueValue);
    Log.Debug(`filter ${filter}`);
    const records = await this.RecordsAsync(name, {
      $filter: filter,
      top: 0,
    });
    return records.items;
  }

  /**
   * Create or update a record content
   * @param {the API endpoint} name
   * @param {the object to create or update} payload
   * @param {the unique field to identify} fieldName
   */
  async CreateOrUpdateAsync(name, payload, fieldName) {
    await this.ensureValidClient();
    Log.Debug(`CreateOrUpdate(${name}, ${payload}, ${fieldName})`);
    const uniqueValue = payload.data[`${fieldName}`].iv;
    const record = await this.FindOne(name, fieldName, uniqueValue);
    const self = this;
    if (record) {
      const update = await self.UpdateAsync(name, { id: record.id, data: payload.data });
      const cacheEntry = { id: null, data: update };
      if (update && !update.id) {
        update.id = record.id;
        cacheEntry.id = record.id;
      } else if (update && update.id) {
        cacheEntry.id = update.id;
      } else {
        return update;
      }
      return update;
    }
    const create = await this.CreateAsync(name, payload);
    return create;
  }

  async CreateAssetAsync(assetUrl) {
    await this.ensureValidClient();
    // This is a work in progressgg
    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(assetUrl));
      form.append('mimeType', 'jpeg');

      const res = await this.squidexApi.apis.Assets.Assets_PostAsset({ app: this.appName, file: form });
      return res;
    } catch (error) {
      Log.Error(error);
      return null;
    }
  }
}
module.exports.SquidexClientManager = SquidexClientManager;
