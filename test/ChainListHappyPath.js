const ChainList = artifacts.require("ChainList.sol");

//test suite
contract('ChainList', function(accounts){
    let chainListInstance;
    const seller = accounts[2];
    const buyer = accounts[1];
    const articleName1 = "article1";
    const articleDesc1 = "Description for article 1";
    const articlePrice1 = 10;
    const articleName2 = "article2";
    const articleDesc2 = "Description for article 2";
    const articlePrice2 = 20;
    let sellerBalanceBeforeBuy;
    let sellerBalanceAfterBuy;
    let buyerBalanceBeforeBuy;
    let buyerBalanceAfterBuy;

    before("set up contract instance for each test", async () => {
        chainListInstance = await ChainList.deployed();
    })

    it("should be initialised with empty values", async ()=> {
        let data = await chainListInstance.getNumberOfArticles();
        assert.equal(Number(data), 0, "number of articles must be 0");
        data = await chainListInstance.getArticlesForSale();
        assert.equal(data.length, 0, "there shouldn't be any articles for sale");
    })
    

    //sell a frist article
    it("should let us sell a first article", async () => {
        const receipt = await chainListInstance.sellArticle(articleName1, articleDesc1, web3.utils.toWei(JSON.stringify(articlePrice1), 'ether'),  {from: seller});   
        
        //check event
        assert.equal(receipt.logs.length, 1, "one event should have been triggered");
        assert.equal(receipt.logs[0].event, 'LogSellArticle', "event should be LogSellArticle");
        assert.equal(receipt.logs[0].args._id, 1, 'id must be 1');
        assert.equal(receipt.logs[0].args._seller, seller, 'event seller must be ' + seller);
        assert.equal(receipt.logs[0].args._name, articleName1, 'event articleName must be ' + articleName1);
        assert.equal(JSON.stringify(receipt.logs[0].args._price), JSON.stringify(web3.utils.toWei(web3.utils.toBN(articlePrice1)), 'ether') , 'event articlePrice must be ' + web3.utils.toWei(web3.utils.toBN(articlePrice1), 'ether'));

        let data = await chainListInstance.getNumberOfArticles();
        assert.equal(data,1,'number of articles must be one');
        
        data = await chainListInstance.getArticlesForSale();
        assert.equal(data.length, 1, 'there must be one article for sale');
        assert.equal(Number(data[0]), 1, 'article id must be 1');

        data = await chainListInstance.articles(data[0]);
        assert.equal(Number(data[0]), 1 , 'article id must be 1');
        assert.equal(data[1], seller, 'seller must be ' + seller);
        assert.equal(data[2], 0x0, 'buyer must be empty');
        assert.equal(data[3], articleName1, 'article name must be ' + articleName1);
        assert.equal(data[4], articleDesc1, 'article desc must be ' + articleDesc1);
        assert.equal(JSON.stringify(data[5]), JSON.stringify(web3.utils.toWei(web3.utils.toBN(articlePrice1))), 'article price must be ' + web3.utils.toWei(web3.utils.toBN(articlePrice1), 'ether'));
    })


    //sell a second article
    it("should let us sell a second article", async () => {
        const receipt = await chainListInstance.sellArticle(articleName2, articleDesc2, web3.utils.toWei(JSON.stringify(articlePrice2), 'ether'),  {from: seller});   
        //check event
        assert.equal(receipt.logs.length, 1, "one event should have been triggered");
        assert.equal(receipt.logs[0].event, 'LogSellArticle', "event should be LogSellArticle");
        assert.equal(receipt.logs[0].args._id, 2, 'id must be 1');
        assert.equal(receipt.logs[0].args._seller, seller, 'event seller must be ' + seller);
        assert.equal(receipt.logs[0].args._name, articleName2, 'event articleName must be ' + articleName2);
        assert.equal(JSON.stringify(receipt.logs[0].args._price),JSON.stringify(web3.utils.toWei(web3.utils.toBN(articlePrice2), 'ether')) , 'event articlePrice must be ' + web3.utils.toWei(web3.utils.toBN(articlePrice2), 'ether'));

        let data = await chainListInstance.getNumberOfArticles();
        assert.equal(data,2,'number of articles must be two');

        data = await chainListInstance.getArticlesForSale();
        assert.equal(data.length, 2, 'there must be two article for sale');
        assert.equal(Number(data[1]), 2, 'article id must be 2');

        data = await chainListInstance.articles(data[1]);
        assert.equal(data[0], 2 , 'article id must be 2');
        assert.equal(data[1], seller, 'seller must be ' + seller);
        assert.equal(data[2], 0x0, 'buyer must be empty');
        assert.equal(data[3], articleName2, 'article name must be ' + articleName2);
        assert.equal(data[4], articleDesc2, 'article desc must be ' + articleDesc2);
        assert.equal(JSON.stringify(data[5]), JSON.stringify(web3.utils.toWei(web3.utils.toBN(articlePrice2))), 'article price must be ' + web3.utils.toWei(web3.utils.toBN(articlePrice2), 'ether'));      
    })

    //buy the first article
    it("should buy the first article", async () => {
        //record balances of seller and buyer before the buy
        sellerBalanceBeforeBuy = web3.utils.fromWei(web3.utils.toBN(await web3.eth.getBalance(seller)), 'ether');
        buyerBalanceBeforeBuy = web3.utils.fromWei(web3.utils.toBN(await web3.eth.getBalance(buyer)), 'ether');

        let receipt = await chainListInstance.buyArticle(1,{
            from: buyer,
            value: web3.utils.toWei(JSON.stringify(articlePrice1), 'ether')
        })
        assert.equal(receipt.logs.length, 1, "one event should have been triggered");
        assert.equal(receipt.logs[0].event, 'LogBuyArticle', "event should be LogBuyArticle");
        assert.equal(receipt.logs[0].args._id, 1, "id should be 1");
        assert.equal(receipt.logs[0].args._seller, seller, 'event seller must be ' + seller);
        assert.equal(receipt.logs[0].args._buyer, buyer, 'event buyer must be ' + buyer);
        assert.equal(receipt.logs[0].args._name, articleName1, 'event articleName must be ' + articleName1);
        assert.equal(JSON.stringify(receipt.logs[0].args._price), JSON.stringify(web3.utils.toWei(web3.utils.toBN(articlePrice1), 'ether')) , 'event articlePrice must be ' + web3.utils.toWei(web3.utils.toBN(articlePrice1), 'ether'));
        
        //record balances of buyer and seller after the buy
        sellerBalanceAfterBuy = web3.utils.fromWei(web3.utils.toBN(await web3.eth.getBalance(seller)), 'ether');
        buyerBalanceAfterBuy = web3.utils.fromWei(web3.utils.toBN(await web3.eth.getBalance(buyer)), 'ether');
        
        const articlesForSale = await chainListInstance.getArticlesForSale();

        //check the effect of buy on balances of buyer and seller, accounting for gas
        assert(sellerBalanceAfterBuy == Number(sellerBalanceBeforeBuy) + articlePrice1, 'seller should have earned ' + articlePrice1 + ' ETH');
        assert(buyerBalanceAfterBuy <= Number(buyerBalanceBeforeBuy) - articlePrice1, 'buyer should have spent ' + articlePrice1 + ' ETH');
        
        assert.equal(articlesForSale.length, 1, 'there should now be only 1 article left for sale')
        assert.equal(Number(articlesForSale[0]), 2, "article 2 should be the only article left for sale");
        
        const articlesNum = await chainListInstance.getNumberOfArticles();
        assert.equal(Number(articlesNum), 2, 'there should still be 2 articles in total');
    })
})