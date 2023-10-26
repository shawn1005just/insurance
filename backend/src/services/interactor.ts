import { exec } from "child_process";

let init = "cd ~/go/src/github.com/raika/fabric-samples/test-network";
init += " && export PATH=${PWD}/../bin:$PATH";
init += " && export FABRIC_CFG_PATH=$PWD/../config/";
init += " && export CORE_PEER_TLS_ENABLED=true";
init += ' && export CORE_PEER_LOCALMSPID="Org1MSP"';
init +=
  " && export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt";
init +=
  " && export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp";
init += " && export CORE_PEER_ADDRESS=localhost:7051 && ";
let cmd1 =
  init +
  'peer chaincode query -C mychannel -n basic -c \'{"Args":["GetAllAssets"]}\'';

let cmd =
  init +
  'peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c \'{"function":"CreateAsset","Args":["asset6"]}\'';

let cmd2 =
  init +
  'peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c \'{"function":"TransferAsset","Args":["asset6", "100"]}\'';

export default {
  CreateAccount: async () => {
    exec(cmd1, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        // node couldn't execute the command
        return;
      }
      const result = JSON.parse(stdout);
      console.log(result);
    });
  },
};
