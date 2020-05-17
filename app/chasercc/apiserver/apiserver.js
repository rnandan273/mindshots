var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
// Setting for Hyperledger Fabric
const { Wallets, Gateway } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');

async function getContract(){
    try {
// Create a new file system based wallet for managing identities.
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('chasercc');
        return contract;
    } catch (error) {
        console.error(`Failed to get contract`);
        res.status(500).json({error: error});
        process.exit(1);
    }

}

app.post('/api/createealrequest/', async function (req, res) {
    try {
        contract = await getContract();
        const contract = network.getContract('chasercc');
        await contract.submitTransaction('createEalRequest', req.body.slNumber, req.body.quantity, req.body.metadata, req.body.owner);
        console.log('Transaction has been submitted');
        res.send('Transaction has been submitted');
// Disconnect from the gateway.
        await gateway.disconnect();
} catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
})



app.post('/api/approveealrequest/', async function (req, res) {
    try {
        contract = await getContract();
        const contract = network.getContract('chasercc');
        const result = await contract.evaluateTransaction('approveEalRequest',req.body.slNumber,req.body.owner);
        console.log('Transaction has been submitted');
        res.send('Transaction has been submitted');
// Disconnect from the gateway.
        await gateway.disconnect();
} catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
})

app.get('/api/queryealrequests', async function (req, res) {
    try {
// Create a new file system based wallet for managing identities.
        contract = await getContract();
        const result = await contract.evaluateTransaction('queryEalRequests','','');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.setHeader('Content-Type', 'application/json')
        res.status(200).json({response: JSON.parse(result)})
} catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});


app.get('/api/queryallcars', async function (req, res) {
    try {
// Create a new file system based wallet for managing identities.
        contract = await getContract();
        const result = await contract.evaluateTransaction('queryAllCars');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.setHeader('Content-Type', 'application/json')
        res.status(200).json({response: JSON.parse(result)})
} catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});
app.get('/api/query/:car_index', async function (req, res) {
    try {
        contract = await getContract();
        const result = await contract.evaluateTransaction('queryCar', req.params.car_index);
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.setHeader('Content-Type', 'application/json')
        res.status(200).json({response: JSON.parse(result)})
} catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});
app.post('/api/addcar/', async function (req, res) {
    try {
        contract = await getContract();
        const contract = network.getContract('chasercc');
        await contract.submitTransaction('createCar', req.body.carid, req.body.make, req.body.model, req.body.colour, req.body.owner);
        console.log('Transaction has been submitted');
        res.send('Transaction has been submitted');
// Disconnect from the gateway.
        await gateway.disconnect();
} catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
})

app.put('/api/changeowner/:car_index', async function (req, res) {
    try {
        contract = await getContract();
        await contract.submitTransaction('changeCarOwner', req.params.car_index, req.body.owner);
        console.log('Transaction has been submitted');
        res.send('Transaction has been submitted');
// Disconnect from the gateway.
        await gateway.disconnect();
} catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    } 
})

app.get('/api/queryeal/:eal_index', async function (req, res) {
    try {
        contract = await getContract();
        const result = await contract.submitTransaction('queryEal', req.params.eal_index);
        console.log('Transaction has been submitted');
        //res.send('Transaction has been submitted');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.setHeader('Content-Type', 'application/json')
        res.status(200).json({response: JSON.parse(result)})
// Disconnect from the gateway.
        await gateway.disconnect();
} catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    } 
})

app.get('/api/queryusereal/:user_index', async function (req, res) {
    try {
        contract = await getContract();
        const result = await contract.submitTransaction('queryUserEals','','', req.params.user_index);
        console.log('Transaction has been submitted');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.setHeader('Content-Type', 'application/json')
        res.status(200).json({response: JSON.parse(result)})
// Disconnect from the gateway.
        await gateway.disconnect();
} catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    } 
})

app.get('/api/queryealhistory/:eal_index', async function (req, res) {
    try {
        contract = await getContract();
        const result = await contract.submitTransaction('retrieveHistory', req.params.eal_index);
        console.log('Transaction has been submitted');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.setHeader('Content-Type', 'application/json')
        res.status(200).json({response: JSON.parse(result)})
// Disconnect from the gateway.
        await gateway.disconnect();
} catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    } 
})


app.get('/api/queryalleals', async function (req, res) {
    try {
// Create a new file system based wallet for managing identities.
        contract = await getContract();
        const result = await contract.evaluateTransaction('queryEals','','');
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.setHeader('Content-Type', 'application/json')
        res.status(200).json({response: JSON.parse(result)});
} catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
});


app.post('/api/addeal/', async function (req, res) {
    try {
        const gateway = new Gateway();
        contract = await getContract();
        await contract.submitTransaction('createEal', req.body.ealid, req.body.metadata, req.body.owner);
        console.log('Transaction has been submitted');
        res.status(200).json({response: 'Transaction has been submitted'});
// Disconnect from the gateway.
        await gateway.disconnect();
} catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
})


app.put('/api/changeealowner/', async function (req, res) {
    try {
        const gateway = new Gateway();
        contract = await getContract();
        await contract.submitTransaction('changeEalOwner', req.body.ealid,req.body.metadata,req.body.state, req.body.owner);
        console.log('Transaction has been submitted');
        res.status(200).json({response: 'Transaction has been submitted'});
// Disconnect from the gateway.
        await gateway.disconnect();
} catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    } 
})

async function contractEvents() {

  try {

    let response;
    const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');
        // Get the contract from the network.
        const contract = network.getContract('chasercc');

        await contract.addContractListener('my-contract-listener', 'OwnerChangeEvent', (err, event, blockNumber, transactionId, status) => {
        if (err) {
        console.error(err);
        return;
        }

      //convert event to something we can parse 
      event = event.payload.toString();
      event = JSON.parse(event)
      console.log("GOT EVENT")
      console.log(event)
      gateway.disconnect()});
} catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    } 
}
contractEvents();

app.listen(8080);
