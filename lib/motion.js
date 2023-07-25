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
    this.log('Trigger a new event');
    console.log(" event start ")
    axios.post("http://127.0.0.1:3000/event",
      {'Content-Type': 'application/json'})
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      })
  }

  eventEnd() {
    this.log('Trigger the end of a event');
    return this.fetch('/action/eventend');
  }

  log(msg) {
    const date = new Date().toLocaleString();
    console.log(`[${date}] Motion: ${msg}`);
  }
};
