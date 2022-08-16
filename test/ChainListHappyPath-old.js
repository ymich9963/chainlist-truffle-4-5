var ChainList = artifacts.require("ChainList.sol");

//test suite
contract('ChainList', function(accounts){
    var chainListInstance;
    var seller = accounts[2];
    var buyer = accounts[1];
    var articleName1 = "article1";
    var articleDesc1 = "Description for article 1";
    var articlePrice1 = 10;
    var articleName2 = "article2";
    var articleDesc2 = "Description for article 2";
    var articlePrice2 = 20;
    var sellerBalanceBeforeBuy;
    var sellerBalanceAfterBuy;
    var buyerBalanceBeforeBuy;
    var buyerBalanceAfterBuy;

    it("should be initialised with empty values", function(){
        return ChainList.deployed().then(function(instance){
            chainListInstance = instance;
            return instance.getNumberOfArticles();
        }).then(function(data){
            assert.equal(Number(data), 0, "number of articles must be 0");
            return chainListInstance.getArticlesForSale();
        }).then(function(data){
            assert.equal(data.length, 0, "there shouldn't be any articles for sale");
        })
    })

    //sell a frist article
    it("should let us sell a first article", function(){
        return ChainList.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.sellArticle(articleName1, articleDesc1, web3.utils.toWei(JSON.stringify(articlePrice1), 'ether'),  {from: seller});   
        }).then(function(receipt){
            //check event

            assert.equal(receipt.logs.length, 1, "one event should have been triggered");
            assert.equal(receipt.logs[0].event, 'LogSellArticle', "event should be LogSellArticle");
            assert.equal(receipt.logs[0].args._id, 1, 'id must be 1');
            assert.equal(receipt.logs[0].args._seller, seller, 'event seller must be ' + seller);
            assert.equal(receipt.logs[0].args._name, articleName1, 'event articleName must be ' + articleName1);
            assert.equal(JSON.stringify(receipt.logs[0].args._price), JSON.stringify(web3.utils.toWei(web3.utils.toBN(articlePrice1)), 'ether') , 'event articlePrice must be ' + web3.utils.toWei(web3.utils.toBN(articlePrice1), 'ether'));

            return chainListInstance.getNumberOfArticles();
        }).then(function(data){
            assert.equal(data,1,'number of articles must be one');
            return chainListInstance.getArticlesForSale();
        }).then(function(data){
            assert.equal(data.length, 1, 'there must be one article for sale');
            assert.equal(Number(data[0]), 1, 'article id must be 1');
            return chainListInstance.articles(data[0]);
        }).then(function(data){
            assert.equal(Number(data[0]), 1 , 'article id must be 1');
            assert.equal(data[1], seller, 'seller must be ' + seller);
            assert.equal(data[2], 0x0, 'buyer must be empty');
            assert.equal(data[3], articleName1, 'article name must be ' + articleName1);
            assert.equal(data[4], articleDesc1, 'article desc must be ' + articleDesc1);
            assert.equal(JSON.stringify(data[5]), JSON.stringify(web3.utils.toWei(web3.utils.toBN(articlePrice1))), 'article price must be ' + web3.utils.toWei(web3.utils.toBN(articlePrice1), 'ether'));
        })
    })


    //sell a second article
    it("should let us sell a second article", function(){
        return ChainList.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.sellArticle(articleName2, articleDesc2, web3.utils.toWei(JSON.stringify(articlePrice2), 'ether'),  {from: seller});   
        }).then(function(receipt){
            //check event
            assert.equal(receipt.logs.length, 1, "one event should have been triggered");
            assert.equal(receipt.logs[0].event, 'LogSellArticle', "event should be LogSellArticle");
            assert.equal(receipt.logs[0].args._id, 2, 'id must be 1');
            assert.equal(receipt.logs[0].args._seller, seller, 'event seller must be ' + seller);
            assert.equal(receipt.logs[0].args._name, articleName2, 'event articleName must be ' + articleName2);
            assert.equal(JSON.stringify(receipt.logs[0].args._price),JSON.stringify(web3.utils.toWei(web3.utils.toBN(articlePrice2), 'ether')) , 'event articlePrice must be ' + web3.utils.toWei(web3.utils.toBN(articlePrice2), 'ether'));

            return chainListInstance.getNumberOfArticles();
        }).then(function(data){
            assert.equal(data,2,'number of articles must be two');
            return chainListInstance.getArticlesForSale();
        }).then(function(data){
            assert.equal(data.length, 2, 'there must be two article for sale');
            assert.equal(Number(data[1]), 2, 'article id must be 2');
            return chainListInstance.articles(data[1]);
        }).then(function(data){
            assert.equal(data[0], 2 , 'article id must be 2');
            assert.equal(data[1], seller, 'seller must be ' + seller);
            assert.equal(data[2], 0x0, 'buyer must be empty');
            assert.equal(data[3], articleName2, 'article name must be ' + articleName2);
            assert.equal(data[4], articleDesc2, 'article desc must be ' + articleDesc2);
            assert.equal(JSON.stringify(data[5]), JSON.stringify(web3.utils.toWei(web3.utils.toBN(articlePrice2))), 'article price must be ' + web3.utils.toWei(web3.utils.toBN(articlePrice2), 'ether'));
        })
    })

    //buy the first article
    it("should buy the first article", function(){
        return ChainList.deployed().then(function(instance){
            chainListInstance = instance;
            
            //record balances of seller and buyer before the buy
            web3.eth.getBalance(seller, function(err, balance){
                sellerBalanceBeforeBuy = web3.utils.fromWei(web3.utils.toBN(balance), "ether");
            });
            web3.eth.getBalance(buyer, function(err, balance){
                buyerBalanceBeforeBuy = web3.utils.fromWei(web3.utils.toBN(balance), "ether");
            });

            return chainListInstance.buyArticle(1,{
                from: buyer,
                value: web3.utils.toWei(JSON.stringify(articlePrice1), 'ether')
            })
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, "one event should have been triggered");
            assert.equal(receipt.logs[0].event, 'LogBuyArticle', "event should be LogBuyArticle");
            assert.equal(receipt.logs[0].args._id, 1, "id should be 1");
            assert.equal(receipt.logs[0].args._seller, seller, 'event seller must be ' + seller);
            assert.equal(receipt.logs[0].args._buyer, buyer, 'event buyer must be ' + buyer);
            assert.equal(receipt.logs[0].args._name, articleName1, 'event articleName must be ' + articleName1);
            assert.equal(JSON.stringify(receipt.logs[0].args._price), JSON.stringify(web3.utils.toWei(web3.utils.toBN(articlePrice1), 'ether')) , 'event articlePrice must be ' + web3.utils.toWei(web3.utils.toBN(articlePrice1), 'ether'));
        
            //record balances of buyer and seller after the buy
            web3.eth.getBalance(seller, function(err, balance){
                sellerBalanceAfterBuy = web3.utils.fromWei(web3.utils.toBN(balance), "ether");
            });
            web3.eth.getBalance(buyer, function(err, balance){
                buyerBalanceAfterBuy = web3.utils.fromWei(web3.utils.toBN(balance), "ether");
            });

            return chainListInstance.getArticlesForSale();

            //check the effect of buy on balances of buyer and seller, accounting for gas
        }).then(function(data){
            //was required for promises to finish
            return data
        }).then(function(data){
            assert(sellerBalanceAfterBuy == Number(sellerBalanceBeforeBuy) + articlePrice1, 'seller should have earned ' + articlePrice1 + ' ETH');
            assert(buyerBalanceAfterBuy <= Number(buyerBalanceBeforeBuy) - articlePrice1, 'buyer should have spent ' + articlePrice1 + ' ETH');
            return data
        }).then(function(data){
            assert.equal(data.length, 1, 'there should now be only 1 article left for sale')
            assert.equal(Number(data[0]), 2, "article 2 should be the only article left for sale");
            return chainListInstance.getNumberOfArticles();
        }).then(function(data){
            assert.equal(Number(data), 2, 'there should still be 2 articles in total');
        })
    })
})