//contract to be tested
var ChainList = artifacts.require("ChainList.sol");

//test suite
contract('ChainList', function(accounts){
    var chainListInstance;
    var seller = accounts[1];
    var buyer = accounts[2];
    var articleName = 'article1';
    var articleDesc = 'desc for 1';
    var articlePrice = 10;

    //no article for sale yet
    it('should throw an exception if you try to buy an article when there is no article for sale yet', function(){
        return ChainList.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.buyArticle(1,{
                from: buyer,
                value: web3.utils.toWei(JSON.stringify(articlePrice), 'ether')
            })
        }).then(function(){
            assert.fail()
        }).catch(function(error){
            assert(true);
        }).then(function(){
            return chainListInstance.getNumberOfArticles();
        }).then(function(data){
            assert.equal(Number(data), 0, "number of articles must be 0");
        })
    })

    //buy article that does not exist
    it('should throw an exception if you try to buy an article that does not exist',function(){
        return ChainList.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.sellArticle(articleName, articleDesc, web3.utils.toWei(JSON.stringify(articlePrice), 'ether'), {from: seller});
        }).then(function(receipt){
            return chainListInstance.buyArticle(2, {from:seller, value: web3.utils.toWei(JSON.stringify(articlePrice), 'ether')});
        }).then(function(){
            assert.fail();
        }).catch(function(error){
            assert(true);
        }).then(function(){
            return chainListInstance.articles(1);
        }).then(function(data){
            assert.equal(Number(data[0]), 1, 'article id must be 1');
            assert.equal(data[1], seller, 'seller must be ' + seller);
            assert.equal(data[2], 0x0, 'buyer must be empty');
            assert.equal(data[3], articleName, 'article name must be ' + articleName);
            assert.equal(data[4], articleDesc, 'article desc must be ' + articleDesc);
            assert.equal(JSON.stringify(data[5]), JSON.stringify(web3.utils.toWei(web3.utils.toBN(articlePrice))), 'article price must be ' + web3.utils.toWei(web3.utils.toBN(articlePrice), 'ether'));

        })
    })

    //buying an article you are selling
    it('should throw exception if you try to buy your own article', function(){
        return ChainList.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.buyArticle(1,{from: seller, value: web3.utils.toWei(JSON.stringify(articlePrice), 'ether')});
        }).then(function(){
            assert.fail()
        }).catch(function(error){
            assert(true);
        }).then(function(){
            return chainListInstance.articles(1);
        }).then(function(data){
            assert.equal(Number(data[0]), 1, "article id must be 1 " + seller);
            assert.equal(data[1], seller, "seller must be " + seller);
            assert.equal(data[2], 0x0, "buyer name must be empty");
            assert.equal(data[3], articleName, "article name must be " + articleName);            
            assert.equal(data[4], articleDesc , "article description must be" + articleDesc);            
            assert.equal(BigInt(data[5]), web3.utils.toWei(JSON.stringify(articlePrice)), "article price must be " + articlePrice);
        })
    })   
    
    //incorrect value
    it('should throw exception if you try to buy an article for a value different from its price', function(){
        return ChainList.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.buyArticle(1,{from: buyer, value: web3.utils.toWei(JSON.stringify(articlePrice + 1), 'ether')});
        }).then(function(){
            assert.fail()
        }).catch(function(error){
            assert(true);
        }).then(function(){
            return chainListInstance.articles(1);
        }).then(function(data){
            assert.equal(Number(data[0]), 1, "article id must be 1 " + seller);
            assert.equal(data[1], seller, "seller must be " + seller);
            assert.equal(data[2], 0x0, "buyer name must be empty");
            assert.equal(data[3], articleName, "article name must be " + articleName);            
            assert.equal(data[4], articleDesc , "article description must be" + articleDesc);            
            assert.equal(BigInt(data[5]), web3.utils.toWei(JSON.stringify(articlePrice)), "article price must be " + articlePrice);
        })
    })

    //article has already been sold
    it('should throw exception if you try to buy an article that has alread been sold ', function(){
        return ChainList.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.buyArticle(1,{from: buyer, value: web3.utils.toWei(JSON.stringify(articlePrice), 'ether')});
        }).then(function(){
            return chainListInstance.buyArticle(1,{from: accounts[0], value: web3.utils.toWei(JSON.stringify(articlePrice), 'ether')});
        }).then(function(){
            assert.fail()
        }).catch(function(error){
            assert(true);
        }).then(function(){
            return chainListInstance.articles(1);
        }).then(function(data){
            assert.equal(Number(data[0]), 1, "article id must be 1 ");
            assert.equal(data[1], seller, "seller must be " + seller);
            assert.equal(data[2], buyer, "buyer name must be " + buyer);
            assert.equal(data[3], articleName, "article name must be " + articleName);            
            assert.equal(data[4], articleDesc , "article description must be" + articleDesc);            
            assert.equal(BigInt(data[5]), web3.utils.toWei(JSON.stringify(articlePrice)), "article price must be " + articlePrice);
        })
    })
})