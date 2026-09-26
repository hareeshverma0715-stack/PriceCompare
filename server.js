const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));


// TEST API

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "PriceCompare backend successfully connected!"
    });

});


// REAL SHOPPING SEARCH

app.get("/api/search", async (req, res) => {

    const query = req.query.q;

    if (!query) {

        return res.json({
            success: false,
            message: "Product name enter karo."
        });

    }


    try {

        const response = await axios.get(
            "https://serpapi.com/search.json",
            {
                params: {
                    engine: "google_shopping",
                    q: query,
                    api_key: process.env.SERPAPI_KEY,
                    location: "India",
                    hl: "en",
                    gl: "in"
                }
            }
        );


        const shoppingResults =
            response.data.shopping_results || [];


        const results =
            shoppingResults.map(item => {

                return {

                    store:
                        item.source ||
                        "Unknown Store",

                    product:
                        item.title ||
                        query,

                    price:
                        item.extracted_price ||
                        null,

                    link:
                        item.link ||
                        item.product_link ||
                        "#",

                    image:
                        item.thumbnail ||
                        ""

                };

            });


        res.json({

            success: true,

            search: query,

            results: results

        });

    }


    catch (error) {

        console.error(
            error.response?.data ||
            error.message
        );


        res.status(500).json({

            success: false,

            message:
                "Shopping search me problem aa gayi."

        });

    }

});


// START SERVER

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "PriceCompare Server Chalu Hai!"
        );

        console.log(
            `Open: http://localhost:${PORT}`
        );

    }
);