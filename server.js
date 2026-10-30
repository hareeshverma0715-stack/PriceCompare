const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const session = require("express-session");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;


// -------------------------
// MIDDLEWARE
// -------------------------

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "pricecompare-development-secret",

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

app.use(express.static(__dirname));


// -------------------------
// TEMPORARY USERS
// -------------------------

const users = new Map();


// -------------------------
// CHECK LOGIN
// -------------------------

app.get("/api/me", (req, res) => {

    if (!req.session.user) {

        return res.json({
            loggedIn: false
        });

    }

    res.json({
        loggedIn: true,

        user: {
            name: req.session.user.name,
            email: req.session.user.email
        }
    });

});


// -------------------------
// REGISTER
// -------------------------

app.post("/api/register", async (req, res) => {

    try {

        const {
            firstName,
            lastName,
            email,
            password
        } = req.body;


        if (
            !firstName ||
            !lastName ||
            !email ||
            !password
        ) {

            return res.status(400).json({
                success: false,
                message: "Please fill all fields."
            });

        }


        if (password.length < 8) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters."
            });

        }


        const normalizedEmail =
            email.trim().toLowerCase();


        if (users.has(normalizedEmail)) {

            return res.status(409).json({
                success: false,
                message:
                    "This email is already registered."
            });

        }


        const passwordHash =
            await bcrypt.hash(password, 10);


        users.set(
            normalizedEmail,
            {
                name:
                    `${firstName.trim()} ${lastName.trim()}`,

                email: normalizedEmail,

                passwordHash
            }
        );


        res.json({
            success: true,
            message:
                "Account created successfully."
        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Registration failed."
        });

    }

});


// -------------------------
// LOGIN
// -------------------------

app.post("/api/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required."
            });

        }


        const normalizedEmail =
            email.trim().toLowerCase();


        const user =
            users.get(normalizedEmail);


        if (!user) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password."
            });

        }


        const passwordCorrect =
            await bcrypt.compare(
                password,
                user.passwordHash
            );


        if (!passwordCorrect) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password."
            });

        }


        req.session.user = {

            name: user.name,

            email: user.email

        };


        res.json({

            success: true,

            message:
                "Login successful.",

            user: {
                name: user.name,
                email: user.email
            }

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message:
                "Login failed."
        });

    }

});


// -------------------------
// LOGOUT
// -------------------------

app.post("/api/logout", (req, res) => {

    req.session.destroy(() => {

        res.json({
            success: true
        });

    });

});


// -------------------------
// AUTH MIDDLEWARE
// -------------------------

function requireLogin(req, res, next) {

    if (!req.session.user) {

        return res.status(401).json({

            success: false,

            message:
                "Please login first."

        });

    }

    next();

}


// -------------------------
// TEST API
// -------------------------

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message:
            "PriceCompare backend successfully connected!"
    });

});


// -------------------------
// PRODUCT SEARCH
// -------------------------

app.get(
    "/api/search",
    requireLogin,
    async (req, res) => {

        const query =
            req.query.q;


        if (!query) {

            return res.json({

                success: false,

                message:
                    "Product name enter karo."

            });

        }


        try {

            const response =
                await axios.get(
                    "https://serpapi.com/search.json",
                    {
                        params: {

                            engine:
                                "google_shopping",

                            q: query,

                            api_key:
                                process.env.SERPAPI_KEY,

                            location:
                                "India",

                            hl: "en",

                            gl: "in"

                        }
                    }
                );


            const shoppingResults =
                response.data.shopping_results ||
                [];


            const results =
                shoppingResults.map(
                    item => {

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

                    }
                );


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

    }
);


// -------------------------
// START SERVER
// -------------------------

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