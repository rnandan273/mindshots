/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class ChaserCC extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const eals = [];
        const cars = [];
        /*
            {
                color: 'blue',
                make: 'Toyota',
                model: 'Prius',
                owner: 'Tomoko',
            },
            {
                color: 'red',
                make: 'Ford',
                model: 'Mustang',
                owner: 'Brad',
            },
            {
                color: 'green',
                make: 'Hyundai',
                model: 'Tucson',
                owner: 'Jin Soo',
            },
            {
                color: 'yellow',
                make: 'Volkswagen',
                model: 'Passat',
                owner: 'Max',
            },
            {
                color: 'black',
                make: 'Tesla',
                model: 'S',
                owner: 'Adriana',
            },
            {
                color: 'purple',
                make: 'Peugeot',
                model: '205',
                owner: 'Michel',
            },
            {
                color: 'white',
                make: 'Chery',
                model: 'S22L',
                owner: 'Aarav',
            },
            {
                color: 'violet',
                make: 'Fiat',
                model: 'Punto',
                owner: 'Pari',
            },
            {
                color: 'indigo',
                make: 'Tata',
                model: 'Nano',
                owner: 'Valeria',
            },
            {
                color: 'brown',
                make: 'Holden',
                model: 'Barina',
                owner: 'Shotaro',
            },
        ];

        for (let i = 0; i < cars.length; i++) {
            cars[i].docType = 'car';
            await ctx.stub.putState('CAR' + i, Buffer.from(JSON.stringify(cars[i])));
            console.info('Added <--> ', cars[i]);
        }
        */
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryCar(ctx, carNumber) {
        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        console.log(carAsBytes.toString());
        return carAsBytes.toString();
    }


     async queryAllCars(ctx) {
        const startKey = 'CAR0';
        const endKey = 'CAR999';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        let ownerChangeEvent = {
            ealId: '1001'
        }
        await ctx.stub.setEvent('OwnerChangeEvent', Buffer.from(JSON.stringify(ownerChangeEvent)));
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async changeCarOwner(ctx, carNumber, newOwner) {
        console.info('============= START : changeCarOwner ===========');

        const carAsBytes = await ctx.stub.getState(carNumber); // get the car from chaincode state
        if (!carAsBytes || carAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        const car = JSON.parse(carAsBytes.toString());
        car.owner = newOwner;

        await ctx.stub.putState(carNumber, Buffer.from(JSON.stringify(car)));
        console.info('============= END : changeCarOwner ===========');
    }

    async createEal(ctx, ealId, metadata, owner) {
        console.info('============= START : Create EAL ===========');

        const eal = {
            ealId,
            state: 'created',
            doc_type : 'eal',
            metadata,
            created : new Date().toDateString(),
            owner,
        };
        console.log(eal)
        await ctx.stub.putState(ealId, Buffer.from(JSON.stringify(eal)));
        console.info('============= END : Create EAL on Ledger ===========');
    }

     async createEalRequest(ctx, serialNumber, quantity, metadata, owner) {
        console.info('============= START : Create EalRequest ===========');

        const ealRequest = {
            serialNumber,
            quantity,
            metadata,
            doc_type : 'eal_request',
            created : new Date().toDateString(),
            owner,
        };

        await ctx.stub.putState(serialNumber, Buffer.from(JSON.stringify(ealRequest)));
         let createEalRequestEvent = {
            serialNumber: serialNumber,
            owner: owner,
            quantity: quantity,
            date : new Date().toDateString()
        };
        await ctx.stub.setEvent('createEalRequestEvent', Buffer.from(JSON.stringify(createEalRequestEvent)));
        console.info('============= END : Create EalRequest ===========');
    }

    async createProcurementRequest(ctx, serialNumber, quantity, metadata, owner) {
        console.info('============= START : Create ProcurementRequest ===========');

        const ealRequest = {
            serialNumber,
            quantity,
            metadata,
            doc_type : 'proc_request',
            created : new Date().toDateString(),
            owner,
        };

        await ctx.stub.putState(serialNumber, Buffer.from(JSON.stringify(ealRequest)));
        let createProcRequestEvent = {
            serialNumber: serialNumber,
            owner: owner,
            quantity: quantity,
            date : new Date().toDateString()
        };
        await ctx.stub.setEvent('createProcRequestEvent', Buffer.from(JSON.stringify(createProcRequestEvent)));
        console.info('============= END : Create ProcurementRequest ===========');
    }

    async approveEalRequest(ctx, serialNumber, owner) {
        console.info('============= START : Approve EalRequest ===========');

        const ealRequestAsBytes = await ctx.stub.getState(serialNumber); // get the car from chaincode state
        if (!ealRequestAsBytes || ealRequestAsBytes.length === 0) {
            throw new Error(`${serialNumber} does not exist`);
        }
        const ealRequest = JSON.parse(ealRequestAsBytes.toString());
        const quantity = parseInt(ealRequest.quantity,10);

        console.info(quantity);


        for (let i = 0; i < quantity; i++) {
            const ealReqId = 'ealreq-'+serialNumber+"-"+ i;
            const ealReq = {
                            ealReqId,
                            state: 'created',
                            metadata: 'created',
                            doc_type : 'eal_request',
                            updated : new Date().toDateString(),
                            owner,};

            await ctx.stub.putState(ealId, Buffer.from(JSON.stringify(ealReq)));
            let approveEalRequestEvent = {
            serialNumber: serialNumber,
            ealReqId: ealReqId,
            owner: owner,
            date : new Date().toDateString()
        };
            await ctx.stub.setEvent('approveEalRequestEvent', Buffer.from(JSON.stringify(approveEalRequestEvent)));
            console.info('Added <--> ', eal);
        }
    }

    async approveProcurementRequest(ctx, serialNumber, owner) {
        console.info('============= START : Approve Procurement Request ===========');

        const procRequestAsBytes = await ctx.stub.getState(serialNumber); // get the car from chaincode state
        if (!procRequestAsBytes || procRequestAsBytes.length === 0) {
            throw new Error(`${serialNumber} does not exist`);
        }
        const procRequest = JSON.parse(procRequestAsBytes.toString());
        const quantity = parseInt(procRequest.quantity,10);

        let approveProcurementEvent = {
            serialNumber: serialNumber,
            owner: owner,
            date : new Date().toDateString()
        };

        await ctx.stub.setEvent('approveProcurementEvent', Buffer.from(JSON.stringify(approveProcurementEvent)));
        console.info(quantity);
    }

    async queryEal(ctx, ealId) {
        const ealAsBytes = await ctx.stub.getState(ealId); // get the eal from chaincode state
        if (!ealAsBytes || ealAsBytes.length === 0) {
            throw new Error(`${ealId} does not exist`);
        }
        console.log(ealAsBytes.toString());
        return ealAsBytes.toString();
    }

    async queryEals(ctx,startKey,endKey) {
        //const startKey = startKey;
        //const endKey = endKey;
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if(record.doc_type == 'eal')
                allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryEalRequests(ctx,startKey,endKey) {
        //const startKey = startKey;
        //const endKey = endKey;
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if(record.doc_type == 'eal_request')
                allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryProcRequests(ctx,startKey,endKey) {
        //const startKey = startKey;
        //const endKey = endKey;
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if(record.doc_type == 'proc_request')
                allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryUserEals(ctx,startKey,endKey,owner) {
        
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if(record.owner == owner && record.doc_type == 'eal')
                allResults.push({ Key: key, Record: record });
        }
        let ownerChangeEvent = {
            ealId: '1',
            owner: owner
        }
       

        console.info(allResults);
        return JSON.stringify(allResults);
    }
    

    async changeEalOwner(ctx, ealId, metadata, state, newOwner) {
        console.info('============= START : changeEALOwner ===========');

        const ealAsBytes = await ctx.stub.getState(ealId); // get the car from chaincode state
        if (!ealAsBytes || ealAsBytes.length === 0) {
            throw new Error(`${ealId} does not exist`);
        }
        const eal = JSON.parse(ealAsBytes.toString());
        // define and set ownerChangeEvent
        let ownerChangeEvent = {
            ealId: ealId,
            owner: eal.owner,
            newOwner: newOwner
        };


        eal.owner = newOwner;
        //eal.updated = Date.now();
        eal.state = state;
        eal.metadata = eal.metadata + " : " + metadata;
        eal.updated = new Date().toDateString();

        await ctx.stub.putState(ealId, Buffer.from(JSON.stringify(eal)));

        await ctx.stub.setEvent('ownerChangeEvent', Buffer.from(JSON.stringify(ownerChangeEvent)));
       // await ctx.stub.putState(ealId, Buffer.from(JSON.stringify(eal)));
        console.info('============= END : changeEALOwner ===========');
    }

    async approveEal(ctx, ealId, metadata, state, owner) {
        console.info('============= START : approve Eal ===========');

        const ealAsBytes = await ctx.stub.getState(ealId); // get the car from chaincode state
        if (!ealAsBytes || ealAsBytes.length === 0) {
            throw new Error(`${ealId} does not exist`);
        }
        const eal = JSON.parse(ealAsBytes.toString());
        // define and set ownerChangeEvent
        let ealApprovalEvent = {
            ealId: ealId,
            owner: eal.owner,
        };


        if(eal.owner = owner){
            eal.state = state;
            eal.metadata = eal.metadata + " : " + metadata;
            eal.updated = new Date().toDateString();
        }else{
            eal.metadata = eal.metadata + " : " + metadata;
            eal.state = "approval rejected";
            eal.updated = new Date().toDateString();
        }

        await ctx.stub.putState(ealId, Buffer.from(JSON.stringify(eal)));

        await ctx.stub.setEvent('EalApprovalEvent', Buffer.from(JSON.stringify(ealApprovalEvent)));
        await ctx.stub.putState(ealId, Buffer.from(JSON.stringify(eal)));
        console.info('============= END : approve Eal ===========');
    }


  async retrieveHistory(ctx, key) {
    console.info('getting history for key: ' + key);
    let iterator = await ctx.stub.getHistoryForKey(key);
    let result = [];
    let res = await iterator.next();
    while (!res.done) {
      if (res.value) {
        console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
        const obj = JSON.parse(res.value.value.toString('utf8'));
        result.push(obj);
      }
      res = await iterator.next();
    }
    await iterator.close();
    return result;
  }

}

module.exports = ChaserCC;

