const fetch = require('node-fetch');
      

module.exports = class Motion {
  constructor({ base, camId }) {
    this.base = base;
    this.camId = camId;
  }

  fetch(path) {
    const url = new URL(`${this.camId}${path}`, this.base);
    return fetch(url);
  }

  eventStart() {
    this.log(" event arrived");
  }

  eventEnd() {
    this.log(" event end ");
  }

  log(msg) {
    const date = new Date().toLocaleString();
    console.log(`[${date}] Motion: ${msg}`);
  }
};
