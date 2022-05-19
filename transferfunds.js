const mongoose = require("mongoose");

async function run() {
  const db = await mongoose.connect(
    "mongodb://localhost:27017/mongo-transaction-test"
  );

  const Account = mongoose.model("Account", { balance: Number });

  const account1 = await Account.create({ balance: 0 });
  const account2 = await Account.create({ balance: 100 });

  const session = await db.startSession();
  session.startTransaction();

  const amountToTransfer = 50;
  await Account.updateOne(
    { _id: account2 },
    { $inc: { balance: -amountToTransfer } },
    { session }
  );
  await Account.updateOne(
    { _id: account1 },
    { $inc: { balance: amountToTransfer } },
    { session }
  );

  await session.commitTransaction();
  await session.endSession();

  await db.disconnect();
}

run();
