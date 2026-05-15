"use client";

import Navbar from "@/components/Navbar";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BuyProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [message, setMessage] = useState("Loading product...");

  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Product not found");
        return;
      }

      setProduct(data.product);
      setMessage("");
    }

    if (id) fetchProduct();
  }, [id]);

  async function handlePayment() {
    try {
      setMessage("Creating payment order...");

      const orderRes = await fetch(
        "/api/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
          }),
        }
      );

      const orderData =
        await orderRes.json();

      if (!orderRes.ok) {
        setMessage(
          orderData.message ||
            "Payment initialization failed"
        );
        return;
      }

      const options = {
        key: orderData.key,
        amount:
          orderData.amount * 100,
        currency: "INR",
        name: "Axyon",
        description:
          product.title,
        order_id:
          orderData.razorpayOrderId,

        handler: async function (
          response: any
        ) {

          const verifyRes =
            await fetch(
              "/api/payment/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  orderId:
                    orderData.orderId,

                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,
                }),
              }
            );

          const verifyData =
            await verifyRes.json();

          if (!verifyRes.ok) {
            setMessage(
              verifyData.message ||
                "Payment verification failed"
            );
            return;
          }

          setMessage(
            "Payment successful! Product purchased."
          );
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.open();

    } catch (error) {

      setMessage(
        "Something went wrong during payment"
      );

    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

      <section className="px-8 py-12">
        {message && (
          <p className="text-slate-400">
            {message}
          </p>
        )}

        {product && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h1 className="text-3xl font-bold">
              Confirm Purchase
            </h1>

            <div className="mt-6 space-y-3 text-slate-300">
              <p>
                Product:
                {" "}
                {product.title}
              </p>

              <p>
                Price:
                {" "}
                ₹{product.price}
              </p>

              <p>
                Seller:
                {" "}
                {product.seller?.name}
              </p>

              <p>
                College:
                {" "}
                {product.seller?.college}
              </p>
            </div>

            <button
              onClick={handlePayment}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium"
            >
              Continue to Payment
            </button>

            {message && (
              <p className="mt-5 text-sm text-slate-300">
                {message}
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}