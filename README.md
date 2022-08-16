# ChainSkills Truffle Box

This Truffle Box has all you need to create a DApp by following the course delivered by [ChainSkills](https://www.udemy.com/getting-started-with-ethereum-solidity-development/).

This box has been based from [pet-shop-box](https://github.com/truffle-box/pet-shop-box).#

This project has code both for Truffle 4 and Truffle 5 due to the course being outdated. Any file with the "-new" suffix, was created with the updated version of the course, using Truffle 5. The rest of the files were created using the original version of the course, with Truffle 4.

The file app.js uses downloaded truffle-contract.js, web3.js and bootstrap.js that were compatible with Truffle 4 at the time. The Truffle 5 compatible files also have a "-new" suffix.

I will give instructions on how to install and use the smart contract using Ganache and MetaMask. By default it uses Truffle 4 unless you rename the files as explained below or by runninng the provided scripts.

The Solidity code is up to date with the one specified in the pragma statement, therefore no need to rename the .sol files.

## Installation

1. Install Truffle globally.
    ```javascript
    npm install -g truffle
    ```

2. Download project file and install package dependencies in project directory.
    ```javascript
    npm install
    ```

3. Download and install Ganache and MetaMask from https://trufflesuite.com/ and https://metamask.io/. Import accounts into MetaMask from Ganache using the private keys provided when creating a new workspace. Add a new local network for Ganache into MetaMask with the provided Chain Id and RPC URL from the workspace. Connect to this network and check if account balances are correct.

4.  Deploy the contracts using the Ganache network and Truffle.
    ```javascript
    truffle migrate --compile-all --reset --network ganache
    ```


5. Run lite-server to open the web interface in the browser.
    ```javascript
    npm run dev
    ```

6. Connect to website using MetaMask and refresh to see account address and balance at the top.


7. Now you may sell and buy articles using the Ganache in-memory node to interact with the smart contract.


8. Removing the "-new" suffix and adding "-old" to the plain files will let the program run with Truffle 5 instead of Truffle 4. You can use the rename scripts I created to ease with changing the version currently used.
