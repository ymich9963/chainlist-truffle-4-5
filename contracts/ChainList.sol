//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.11;

import './Ownable.sol';


contract ChainList is Ownable{

    //custome types
    struct Article{
        uint id;
        address payable seller;
        address buyer;
        string name;
        string description;
        uint256 price;
    }

    //state vars
    mapping (uint => Article) public articles;
    uint articleCounter;
    

    //events
    event LogSellArticle(
        uint indexed _id,
        address indexed _seller,
        string _name,
        uint256 _price
    );

    event LogBuyArticle(
        uint indexed _id,
        address indexed _seller,
        address indexed _buyer,
        string _name,
        uint256 _price
    );

    //deactivate contract
    function kill() public onlyOwner {
        selfdestruct(owner);
    }

    //sell an article
    function sellArticle(string memory _name, string memory _desc, uint256 _price) public{
        //a new article
        articleCounter++;

        //storing this article
        articles[articleCounter] = Article(
            articleCounter,
            payable(msg.sender),
            address(0),
            _name,
            _desc,
            _price
        );
        
        emit LogSellArticle(articleCounter, payable(msg.sender) , _name, _price);
    }

    //fetch the number of articles in the contract
    function getNumberOfArticles() public view returns (uint){
        return articleCounter;
    }

    //fetch and return all article IDs for articles still for sale
    function getArticlesForSale() public view returns (uint[] memory){
        //prepare output array
        uint[] memory articleIds = new uint[](articleCounter);

        uint numberOfArticlesForSale = 0;

        //iterate over articles
        for(uint i = 1; i <= articleCounter; i++){
            //keep the id if the article is still for sale
            if(articles[i].buyer == address(0)){
                articleIds[numberOfArticlesForSale] = articles[i].id;
                numberOfArticlesForSale++;
            }
        }

        //copy the articleIds array into a smaller forSale array
        uint[] memory forSale = new uint[](numberOfArticlesForSale);
        for(uint j = 0; j < numberOfArticlesForSale; j++){
            forSale[j] = articleIds[j];
        }
        return forSale;
    }


    //buy an article
    function buyArticle(uint _id) public payable{
        //we check whether there is an article for sale
        require(articleCounter > 0, "There should be at least one article");

        //we check that the article exists
        require(_id > 0 && _id <= articleCounter, "Article should exist" );

        //we retrieve the article with a pointer
        Article storage article = articles[_id];

        //we check that article has not been sold yet
        require(article.buyer == address(0), "Article has already been sold");

        //we don't allow seller to buy his own article
        require(msg.sender != article.seller, "Article should not be your own");

        //we check that the value sent corresponds to the price of the article
        require(msg.value == article.price, "Article price is different than what inputed");

        //keep buyers information
        article.buyer = msg.sender;

        //the buyer can pay the seller
        article.seller.transfer(msg.value);

        //trigger event
        emit LogBuyArticle(_id, article.seller, article.buyer, article.name, article.price);
    }


}