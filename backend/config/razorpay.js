import Razorpay from "razorpay";

let razorpayClient = null;

/**
 * Initializes and returns the singleton Razorpay client instance.
 * Validates that environment variables are set.
 */
export function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay credentials missing. Please define RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the backend .env configuration."
    );
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id,
      key_secret,
    });
  }

  return razorpayClient;
}

export default getRazorpayClient;
