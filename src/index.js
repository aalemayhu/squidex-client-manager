// The API is generated from the swagger-js module
const Swagger = require('swagger-client');

const { SquidexTokenManager } = require('./token_manager');
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
 * SquidexClientManager is Javascript wrapper around the Squidex API provided via Swagger.
 * The implementation relies on the swagger-js generation of the API.
 *
 */
class SquidexClientManager {
  constructor(url, id, secret, cacheFile) {
    this.tokenManager = new SquidexTokenManager(url, id, secret, cacheFile);

    if (!url) {
      throw new Error('Missing client url');
    }
    if (!id) {
      throw new Error('Missing client id');
    }
    if (!secret) {
      throw new Error('Missing client secret');
    }
  }

  /**
   * Connect to the Swagger API
   */
  async ConfigureAsync(specUrl) {
    this.specUrl = specUrl;
    await this.ensureValidClient();
  }

  async ensureValidClient() {
    // Make sure we have a valid token before proceeding
    if (this.client && this.tokenManager.isTokenValid()) {
      return;
    }

    const token = await this.tokenManager.getToken();

    this.client = await new Swagger({
      url: this.specUrl,
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
   * TODO: delete this function
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
    const filter = `data/${identifier}/iv eq '${value}'`;
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
    Log.Debug(`filter ${name} where ${fieldName} eq ${uniqueValue}`);
    const records = await this.RecordsAsync(name, {
      $filter: `data/${fieldName}/iv eq '${uniqueValue}'`,
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
}

module.exports.SquidexClientManager = SquidexClientManager;
