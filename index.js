const {executablePath} = require('puppeteer');
const data = require('./demo/src/input.json')
 
require('dotenv').config();
const puppeteer = require('puppeteer-core');
const fs = require('fs');

const EXECUTABLE_PATH = process.env.EXECUTABLE_PATH

/**
 * Wait for the browser to fire an event (including custom events)
 * @param {puppeteer.page} page - Event name
 * @param {string} eventName - Event name
 * @param {integer} seconds - number of seconds to wait.
 * @returns {Promise} resolves when event fires or timeout is reached
 */
async function waitForEvent(page, eventName, seconds) {

  seconds = seconds || 30;

  // use race to implement a timeout
  return Promise.race([

      // add event listener and wait for event to fire before returning
      page.evaluate(function(eventName) {
          return new Promise(function(resolve, reject) {
              document.addEventListener(eventName, function(e) {
                  resolve(); // resolves when the event fires
              });
          });
      }, eventName),

      // if the event does not fire within n seconds, exit
      page.waitForTimeout(seconds * 1000)
  ]);
}

const urlToElements = async (url, className) => {
  const browser = await puppeteer.launch({ headless: 'new', executablePath: executablePath() });
  const page = await browser.newPage();
  await page.goto(url);

  // Need to wait for simulation 
  await waitForEvent(page, 'simulationEnd', 10)

  console.log('Custom event from client-side has been fired!');

  const elements = await page.$$(`.${className}`);

  const data = [];

  for (const element of elements) {
    const attributes = await element.evaluate((el) => {
      const attributes = {};
      for (const attr of el.attributes) {
        attributes[attr.name] = attr.value;
      }
      return attributes;
    });
    data.push(attributes);
  }
  await browser.close();

  return data;
}

const saveData2File = (data) => {
  const outputFileName = 'exports/output.json';
  fs.writeFileSync(outputFileName, JSON.stringify(data, null, 2));
  console.log(`Data extracted and saved to ${outputFileName}`);
}

async function main() {
  const LIMIT = data.max_timestamps  
  let graph = {
    nodes: [],
    links: [], 
    max_timestamps: LIMIT
  }
  for (let i = 0; i <= LIMIT; i++) {
    const nodes = await urlToElements(`http://localhost:5173/?timestamp=${i}`, 'node')
    graph.nodes = [...graph.nodes, ...nodes]

    const links = await urlToElements(`http://localhost:5173/?timestamp=${i}`, 'link')
    graph.links = [...graph.links, ...links]
  }
  saveData2File(graph)
}

main()