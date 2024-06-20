// src/components/Payment.js
import React, { useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const Payment = () => {
    const query = useQuery();
    const productId = query.get('productId');
    const navigate = useNavigate();

    const initialOptions = {
        "client-id": "AUduax3gUm3UIq9lOJIMJakfNa2VPRxSaTV5CLoSWKaXoAumUlJ7kdwDQpBcUgtCwt1CnnjRwp9XnbGL",
        "enable-funding": "venmo,card,credit",
        "disable-funding": "card",
        // country: "US",
        // currency: "USD",
        "data-page-type": "product-details",
        components: "buttons",
        "data-sdk-integration-source": "developer-studio",
    };

    // useEffect(() => {
    //     const createOrder = async () => {
    //         try {
    //             const res = await axios.post('http://localhost:8000/create-order', { productId });
    //             console.log("res: ", res)
    //             const approvalUrl = res.data.links.find(link => link.rel === 'payer-action').href;
    //             window.location.href = approvalUrl;
    //         } catch (err) {
    //             console.error(err);
    //         }
    //     };
    //     createOrder();
    // }, [productId]);

    return (
        <div>
            <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons
                    style={{
                        shape: 'rect',
                        layout: "vertical",
                        color: "blue",
                        label: "paypal"
                    }}
                    createOrder={async () => {
                        try {
                            const response = await fetch("http://localhost:8000/create-order", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    productId
                                })
                            })
                            const orderData = await response.json();
                            if (orderData.id) {
                                return orderData.id
                            } else {
                                const errorDetail = orderData?.details?.[0];
                                const errorMessage = errorDetail ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                                    : JSON.stringify(orderData);
                                navigate(`/error?message=${errorMessage}`)
                            }
                        } catch (error) {
                            console.log("error: ", error)
                            navigate(`/error?message=${error}`)
                        }
                    }}
                    onApprove={async (data, actions) => {
                        // Three cases to handle:
                        //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                        //   (2) Other non-recoverable errors -> Show a failure message
                        //   (3) Successful transaction -> Show confirmation or thank you message
                        try {
                            const response = await fetch(`http://localhost:8000/api/orders/${data.orderID}/capture`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                            })

                            const orderData = await response.json();

                            const errorDetail = orderData?.details?.[0];

                            if(errorDetail?.issue === "INSTRUMENT_DECLINED") {
                                return actions.restart();
                            }else if(errorDetail) {
                                const errorMessage = errorDetail ? `${errorDetail.description} (${orderData.debug_id})`
                                    : JSON.stringify(orderData);
                                navigate(`/error?message=${errorMessage}`)
                            }else {
                                console.log(
                                    "Capture result",
                                    orderData,
                                    JSON.stringify(orderData, null, 2)
                                  );
                                const transaction = orderData.purchase_units[0].payments.captures[0];
                                navigate(`/success?orderId=${transaction.id}`)
                            }

                        } catch (error) {

                        }
                    }}
                />
            </PayPalScriptProvider>
        </div>
    );
};

export default Payment;
