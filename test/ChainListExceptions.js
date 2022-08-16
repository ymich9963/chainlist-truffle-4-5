//contract to be tested
const ChainList = artifacts.require("ChainList.sol");

//test suite
contract('ChainList', function(accounts){
    let chainListInstance;
    const seller = accounts[1];
    const buyer = accounts[2];
    const articleName = 'article1';
    const articleDesc = 'desc for 1';
    const articlePrice = 10;

        before("set up contract instance for each test", async () => {
        chainListInstance = await ChainList.deployed();
    })

    //no article for sale yet
    it('should throw an exception if you try to buy an article when there is no article for sale yet', async () => {
        try{    
            await chainListInstance.buyArticle(1,{
                    from: buyer,
                    value: web3.utils.toWei(JSON.stringify(articlePrice), 'ether')
                })
                assert.fail();
        }catch(error){
            assert.equal(error.reason, "There should be at least one article");
        }    
        const numberOfArticles = await chainListInstance.getNumberOfArticles();
        assert.equal(Number(numberOfArticles), 0, "number of articles must be 0");
    })

    //buy article that does not exist
    it('should throw an exception if you try to buy an article that does not exist',async () => {
        await chainListInstance.sellArticle(articleName, articleDesc, web3.utils.toWei(JSON.stringify(articlePrice), 'ether'), {from: seller});
    try{
        await chainListInstance.buyArticle(2, {
            from: seller, 
            value: web3.utils.toWei(JSON.stringify(articlePrice), 'ether')
        });
        assert.fail();
    }catch(error){
        assert.equal(error.reason, "Article should exist");
    }
        const data = await chainListInstance.articles(1);
        assert.equal(Number(data[0]), 1, 'article id must be 1');
        assert.equal(data[1], seller, 'seller must be ' + seller);
        assert.equal(data[2], 0x0, 'buyer must be empty');
        assert.equal(data[3], articleName, 'article name must be ' + articleName);
        assert.equal(data[4], articleDesc, 'article desc must be ' + articleDesc);
        assert.equal(JSON.stringify(data[5]), JSON.stringify(web3.utils.toWei(web3.utils.toBN(articlePrice))), 'article price must be ' + web3.utils.toWei(web3.utils.toBN(articlePrice), 'ether'));   
    })

    //buying an article you are selling
    it('should throw exception if you try to buy your own article', async () => {
    try{ 
        await chainListInstance.buyArticle(1,{
            from: seller, 
            value: web3.utils.toWei(JSON.stringify(articlePrice), 'ether')
        });
        assert.fail()
    }catch(error){
        assert.equal(error.reason, "Article should not be your own");
    }
        const data = await chainListInstance.articles(1);
        assert.equal(Number(data[0]), 1, "article id must be 1 " + seller);
        assert.equal(data[1], seller, "seller must be " + seller);
        assert.equal(data[2], 0x0, "buyer name must be empty");
        assert.equal(data[3], articleName, "article name must be " + articleName);            
        assert.equal(data[4], articleDesc , "article description must be" + articleDesc);            
        assert.equal(BigInt(data[5]), web3.utils.toWei(JSON.stringify(articlePrice)), "article price must be " + articlePrice);
    
    })   
    
    //incorrect value
    it('should throw exception if you try to buy an article for a value different from its price', async () => {
        try{    
            await chainListInstance.buyArticle(1,{
                from: buyer, 
                value: web3.utils.toWei(JSON.stringify(articlePrice + 1), 'ether')
            });
            assert.fail()
        }catch(error){
            assert.equal(error.reason, "Article price is different than what inputed");
        } 
        const data = await chainListInstance.articles(1);
        assert.equal(Number(data[0]), 1, "article id must be 1 " + seller);
        assert.equal(data[1], seller, "seller must be " + seller);
        assert.equal(data[2], 0x0, "buyer name must be empty");
        assert.equal(data[3], articleName, "article name must be " + articleName);            
        assert.equal(data[4], articleDesc , "article description must be" + articleDesc);            
        assert.equal(BigInt(data[5]), web3.utils.toWei(JSON.stringify(articlePrice)), "article price must be " + articlePrice);
    })

    //article has already been sold
    it('should throw exception if you try to buy an article that has already been sold ', async () => {
        await chainListInstance.buyArticle(1,{
            from: buyer, 
            value: web3.utils.toWei(JSON.stringify(articlePrice), 'ether')
        });
        try{    
            await chainListInstance.buyArticle(1,{
                from: accounts[0], 
                value: web3.utils.toWei(JSON.stringify(articlePrice), 'ether')
            });
            assert.fail()
        }catch(error){
            assert.equal(error.reason, "Article has already been sold");
        }
        const data = await chainListInstance.articles(1);
        assert.equal(Number(data[0]), 1, "article id must be 1 ");
        assert.equal(data[1], seller, "seller must be " + seller);
        assert.equal(data[2], buyer, "buyer name must be " + buyer);
        assert.equal(data[3], articleName, "article name must be " + articleName);            
        assert.equal(data[4], articleDesc , "article description must be" + articleDesc);            
        assert.equal(BigInt(data[5]), web3.utils.toWei(JSON.stringify(articlePrice)), "article price must be " + articlePrice);
        })
})