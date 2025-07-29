const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function submitOrder() {
  const design = document.getElementById("design").value;
  const size = document.getElementById("size").value;
  const qty = parseInt(document.getElementById("qty").value);
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!name || !phone) {
    alert("กรุณากรอกชื่อและเบอร์โทร");
    return;
  }

  const pricePerShirt = 250;
  const total = qty * pricePerShirt;

  const order = {
    design, size, qty, name, phone, total,
    timestamp: new Date().toISOString(),
    status: "รอชำระ"
  };

  const orderRef = db.ref("orders").push();
  orderRef.set(order).then(() => {
    generateQR(order.total, phone);
  });
}

function generateQR(amount, ref) {
  const promptPayNumber = "0812345678"; // ใส่เบอร์พร้อมเพย์ของคุณ
  const url = `https://promptpay.io/${promptPayNumber}/${amount}.png?ref=${ref}`;
  document.getElementById("qrcode").innerHTML = `
    <h3>QR พร้อมเพย์ ชำระเงิน ${amount} บาท</h3>
    <img src="${url}" alt="QR PromptPay">
  `;
}
