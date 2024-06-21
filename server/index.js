// app.js
const express = require('express');
// const paypal = require('@paypal/checkout-server-sdk');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // Add this line to enable CORS

const PORT = process.env.PORT || 3000;
const base = 'https://api-m.sandbox.paypal.com'; // Base URL for the client

// PayPal SDK setup
// let environment = new paypal.core.SandboxEnvironment(
//     process.env.PAYPAL_CLIENT_ID,
//     process.env.PAYPAL_SECRET_KEY
// );
// let paypalClient = new paypal.core.PayPalHttpClient(environment);

// Sample products
const products = [
    { id: 1, name: 'Product 1', description: 'Description for product 1', price: 10.00 },
    { id: 2, name: 'Product 2', description: 'Description for product 2', price: 20.00 },
    { id: 3, name: 'Product 3', description: 'Description for product 3', price: 30.00 },
];

const generateAccessToken = async () => {
    try {
        const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET_KEY}`).toString('base64');
        const response = await fetch(`${base}/v1/oauth2/token`, {
            method: "POST",
            body: "grant_type=client_credentials",
            headers: {
                Authorization: `Basic ${auth}`
            }
        });

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.log("Failed to generate Access Token: ", error)
    }
}

async function handleResponse(response) {
    try {
        const jsonResponse = await response.json();
        console.log("jsonResponse: ", jsonResponse)
        return {
            jsonResponse,
            httpStatusCode: response.status
        }
    } catch (error) {
        const errorMessage = await response.text();
        return errorMessage;
    }
}

app.get('/products', (req, res) => {
    res.json(products);
});

app.post('/create-order', async (req, res) => {
    const { productId } = req.body;
    const product = products.find(p => p.id == productId);

    if (!product) {
        return res.status(400).json({ error: 'Product not found' });
    }

    try {
        const accessToken = await generateAccessToken();
        const url = `${base}/v2/checkout/orders`;

        const payload = {
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: product.price
                    }
                }
            ],
            payment_source:
            {
                paypal: {
                    experience_context:
                    {
                        payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
                        brand_name: "EXAMPLE INC",
                        locale: "en-US",
                        landing_page: "LOGIN",
                        // shipping_preference: "SET_PROVIDED_ADDRESS",
                        user_action: "PAY_NOW",
                        return_url: "http://localhost:3000/success",
                        cancel_url: "http://localhost:3000/error"
                    }
                }
            }
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                // Documentation: https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
                // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
                // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
                // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
            },
            body: JSON.stringify(payload)
        })

        const { jsonResponse, httpStatusCode } = await handleResponse(response);
        res.status(httpStatusCode).json(jsonResponse);
    } catch (err) {
        console.log("Failed to crate order: ", err)
        res.status(500).json({ error: "Failed to create order." })
    }
});

app.post("/api/orders/:orderID/capture", async (req, res) => {
    try {
        const { orderID } = req.params;
        const accessToken = await generateAccessToken();
        const url = `${base}/v2/checkout/orders/${orderID}/capture`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                // Documentation:
                // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
                // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
                // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
                // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
            }
        });
        const { jsonResponse, httpStatusCode } = await handleResponse(response);
        res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {

    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
