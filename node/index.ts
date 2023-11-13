import { Client } from "pg";
import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";

const app = express();
const port = 5173;

app.use(cors());

const client = new Client({
  user: "postgres",
  host: "db",
  database: "postgres",
  password: "1234",
  port: 5432,
});

const createTable = async () => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS apartments (
      id serial PRIMARY KEY,
      title text,
      href text
    );
  `);
};

createTable();

app.use(express.static("public"));

// Function to scrape website
async function scrapeWebsite() {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    timeout: 10000,
    executablePath: "/usr/bin/chromium",
  });
  const browserPage = await browser.newPage();
  const items: { title: string | null; href: string }[] = [];

  try {
    for (let page = 1; page <= 25; page++) {
      const pageUrl = `https://www.sreality.cz/en/search/for-sale/apartments?page=${page}`;
      await browserPage.goto(pageUrl);
      await browserPage.waitForSelector(".property");

      const pageData = await browserPage.evaluate(() => {
        const itemsOnPage: { title: string | null; href: string }[] = [];

        const propertyElements = document.querySelectorAll(".property");

        propertyElements.forEach((element) => {
          const titleElement = element.querySelector(".name.ng-binding");
          const title = titleElement ? titleElement.textContent : null;

          const linkElement = element.querySelector("img");
          const href = linkElement ? linkElement.getAttribute("src") || "" : "";

          itemsOnPage.push({ title, href });
        });

        return itemsOnPage;
      });

      items.push(...pageData);
    }

    await browser.close();
    return items;
  } catch (error) {
    console.error("Error during scraping:", error);
    await browser.close();
    return null;
  }
}

// Function to insert data into the database
async function insertDataIntoDatabase(data: { title: string | null; href: string }[]) {
  try {
    for (const item of data) {
      const insertDataQuery = `
        INSERT INTO apartments (title, href) VALUES ($1, $2)
      `;
      await client.query(insertDataQuery, [item.title, item.href]);
    }
  } catch (error) {
    console.error("Error during database insertion:", error);
  }
}

// Initialize database connection and start the server
async function startServer() {
  try {
    await client.connect();
    console.log("Connected to the database");

    // Set up the /apartments endpoint to retrieve data from the database
    app.get("/apartments", async (req, res) => {
      try {
        const results = await client.query("SELECT * FROM apartments");
        res.json(results.rows);
      } catch (error) {
        console.error("Error during database query:", error);
        res.status(500).json({ error: "Query failed" });
      }
    });

    app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    });

    // Call the scraping function and insert data into the database
    const scrapedData = await scrapeWebsite();
    if (scrapedData) {
      console.log("Scraping completed");
      await insertDataIntoDatabase(scrapedData);
      console.log("Data inserted into the database");
    } else {
      console.log("Scraping failed.");
    }
  } catch (error) {
    console.error("Error during server initialization:", error);
  }
}

startServer();
