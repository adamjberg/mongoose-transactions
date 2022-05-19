# How to Use Mongoose Transactions

## Install mongoose

```
yarn add mongoose
```

## Simple Script to Demonstrate Transaction

```js
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
```

## Set Up mongodb Replica Set

Mongo requires you to be running a replica set in order to use transactions.  If you try running the code above you without one will see the following error:

```js
(node:459279) UnhandledPromiseRejectionWarning: MongoServerError: Transaction numbers are only allowed on a replica set member or mongos
    at Connection.onMessage (/home/adam/proj/mongoose-transaction/node_modules/mongodb/lib/cmap/connection.js:203:30)
    at MessageStream.<anonymous> (/home/adam/proj/mongoose-transaction/node_modules/mongodb/lib/cmap/connection.js:63:60)
    at MessageStream.emit (events.js:400:28)
    at processIncomingData (/home/adam/proj/mongoose-transaction/node_modules/mongodb/lib/cmap/message_stream.js:108:16)
    at MessageStream._write (/home/adam/proj/mongoose-transaction/node_modules/mongodb/lib/cmap/message_stream.js:28:9)
    at writeOrBuffer (internal/streams/writable.js:358:12)
    at MessageStream.Writable.write (internal/streams/writable.js:303:10)
    at Socket.ondata (internal/streams/readable.js:731:22)
    at Socket.emit (events.js:400:28)
    at addChunk (internal/streams/readable.js:293:12)
```

### Update mongod.conf

```diff
# mongod.conf

# for documentation of all options, see:
#   http://docs.mongodb.org/manual/reference/configuration-options/

# Where and how to store data.
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
#  engine:
#  mmapv1:
#  wiredTiger:

# where to write logging data.
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

# network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1


# how the process runs
processManagement:
  timeZoneInfo: /usr/share/zoneinfo

#security:

#operationProfiling:

- #replication:
+ replication:
+   replSetName: rs0

#sharding:

## Enterprise-Only Options:

#auditLog:

#snmp:
```

## Restart mongo

```
sudo service mongod restart
```

## Initiate Replica Set

```bash
mongo
```

From the mongo shell run:

```
rs.initiate()
```

## Resources

https://mongoosejs.com/docs/transactions.html
https://stackoverflow.com/questions/51461952/mongodb-v4-0-transaction-mongoerror-transaction-numbers-are-only-allowed-on-a