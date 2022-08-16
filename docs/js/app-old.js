App = {
     web3Provider: null,
     contracts: {},
     account: 0x0,
     loading: false,

     init: function() {
          return App.initWeb3();
     },

     initWeb3: function() {
          //initialise web3
          if(typeof web3 != 'undefined'){
               App.web3Provider = web3.currentProvider;
          }else{
               //create a new provider and plug it directly into our local node
               App.web3Provider = new Web3.providers.WebsocketProvider('ws://localhost:7545');
          }
          web3 = new Web3(App.web3Provider);

          App.displayAccountInfo();

          return App.initContract();
     },

     displayAccountInfo: function(){
          web3.eth.getCoinbase(function(err, account){
               if(err == null){
                    App.account = account;
                    $('#account').text(account);
                    web3.eth.getBalance(account, function(err, balance){
                         if(err == null){
                              $('#accountBalance').text(web3.fromWei(balance, "ether") + ' ETH');
                         }
                    })
               }
          })
     },


     initContract: function() {
          $.getJSON('ChainList.json', function(chainListArtifact){
               //get the contract artifact file and use it to instantiate a truffle contract abstraction
               App.contracts.ChainList = TruffleContract(chainListArtifact);
               //set the provider for our contract
               App.contracts.ChainList.setProvider(App.web3Provider);
               //listen to events
               App.listenToEvents();
               //retrieve article from contract
               return App.reloadArticles();
          })
     },

     reloadArticles: function(){
          //avoid reentry
          if(App.loading){
               return;
          }
          App.loading = true;

          //refresh account information because the balance might have changed
          App.displayAccountInfo();

          var chainListInstance;

          App.contracts.ChainList.deployed().then(function(instance){
               chainListInstance = instance;
               return chainListInstance.getArticlesForSale();
          }).then(function(articleIds){
               //retrieve article placeholder and clear it
               $('#articlesRow').empty();

               for(var i = 0; i < articleIds.length; i++){
                    var articleId = articleIds[i];
                    chainListInstance.articles(Number(articleId)).then(function(article){
                         App.displayArticle(article[0], article[1], article[3], article[4], article[5]);
                    })
               }
               App.loading = false;
          }).catch(function(err){
               console.error(err.message);
               App.loading = false;
          })
     },

     displayArticle: function(id, seller, name, desc, price){
          var articlesRow = $('#articlesRow');

          var etherPrice = web3.fromWei(price, 'ether');

          var articleTemplate = $('#articleTemplate');
          articleTemplate.find('.panel-title').text(name);
          articleTemplate.find('.article-description').text(desc);
          articleTemplate.find('.article-price').text(etherPrice + ' ETH');
          articleTemplate.find('.btn-buy').attr('data-id', id);
          articleTemplate.find('.btn-buy').attr('data-value', etherPrice);

          //seller
          if(seller == App.account){
               articleTemplate.find('.article-seller').text('You');
               articleTemplate.find('.btn-buy').hide();
          }else{
               articleTemplate.find('.article-seller').text(seller);
               articleTemplate.find('.btn-buy').show();  
          }

          //add this new article to the list
          articlesRow.append(articleTemplate.html());
     },

     sellArticle: function(){
          //retrieve detail of article
          var _article_name = $('#article_name').val();
          var _description = $('#article_description').val();
          var _price = web3.toWei(parseFloat($('#article_price').val() || 0,), "ether" );
          

          if((_article_name.trim() == '') || (_price == 0)){
               //nothing to sell
               return false;
          }
          App.contracts.ChainList.deployed().then(function(instance){
               return instance.sellArticle(_article_name,_description,_price, {
                    from: App.account,
                    gas: 500000
               }).then(function(result){
                    
               }).catch(function(err){
                    console.error(err);
               })
          })
     },

     //listen to events triggered by contract
     listenToEvents: function(){
          App.contracts.ChainList.deployed().then(function(instance){
               instance.LogSellArticle({},{}).watch(function(error, event){
                    if(!error){
                         $('#events').append('<li class="list-group-item">' + event.args._name + ' is now for sale</li>');
                    }else{
                         console.error(error);
                    }
                    App.reloadArticles();
               })
               instance.LogBuyArticle({},{}).watch(function(error, event){
                    if(!error){
                         $('#events').append('<li class="list-group-item">' + event.args._buyer + ' bought '+ event.args._name + '</li>');
                    }else{
                         console.error(error);
                    }
                    App.reloadArticles();
               })
          })

     },

     buyArticle: function(){
          event.preventDefault();

          //retrieve article price
          var _articleID = $(event.target).data('id');
          var _price = parseFloat($(event.target).data('value'));

          App.contracts.ChainList.deployed().then(function(instance){
               return instance.buyArticle(_articleID,{
                    from: App.account,
                    value: web3.toWei(BigInt(_price), 'ether'),
                    gas: 500000
               })
          }).catch(function(error){
               console.error(error);
          })
     }
};

$(function() {
     $(window).load(function() {
          App.init();
     });
});
