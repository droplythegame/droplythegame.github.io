import*as Player from"../js/player.js";import*as Functions from"../js/functions.js";import*as SpecialCoins from"../js/coins.js";import*as Characters from"./shop/characters.js";import*as Backgrounds from"./shop/backgrounds.js";import*as VirtualStore from"./shop/virtualstore.js";import*as Announcement from"../data/announcement.js";import*as Placement from"../data/a-placement.js";import*as HiT from"../data/ht.js";import*as LoT from"../data/lt.js";import*as Ref from"../data/ref/ref.js";import*as RefT from"../data/ref/ref_t.js";import*as GiveAway from"../data/giveaway.js";const OBSTACLES=15,OBSTACLES_MAX_Y=5e3,TIME=120,SPEED_INCREASE=10,COIN_ABUNDANCE=.5,SHIELD_ABUNDANCE=.1,HEART_PRICE=30;var GameLoopInterval,CheckCollisionInterval,CounterCoinsInterval,ShieldCounterInterval,CheckMusicInterval,CheckSFXInterval,PlayerCharacter=$(".player-character"),Home=$(".home"),CoinsText=$(".coins > .small-display-text"),GameDetails=$(".game-details"),SliderContainer=$(".slidercontainer"),Obstacles=$(".obstacles"),CharactersList=Characters.list.slice(),BackgroundsList=Backgrounds.list.slice(),counterCheckSounds=0,HighestVelocity=0,SpeedIncrease=0,WindowHeight=window.innerHeight,WindowWidth=window.innerWidth,Paused=!1,shieldActive=!1,shieldCounter=10,coins_to_continue=0,last_game_started=0,sfx_on=!1,music_first_time=!0,sfx_first_time=!0;function ContinueOrRestartGame(){SpeedIncrease=0,HighestVelocity=0,FillHearts(),StartGame();let e=Player.GetWallet();CoinsText.text(e),$(".pause-module").removeClass("pause-module-slide-up"),Player.NotPausedGame(),$(".sfx-container audio")[1].pause(),$(".sfx-container audio")[1].currentTime=0}function HandleLocalStorage(){var e=JSON.parse(localStorage.getItem("DroplyPlayer"));if(""==e||null==e||null==e)Player.CreatePlayerID(),localStorage.setItem("DroplyPlayer",JSON.stringify(Player.player)),CoinsText.text(Player.player.wallet),AddNewAnnouncement(),NewAnnouncementDesign();else{Player.player.name=e.name,Player.player.id=e.id,Player.player.character=e.character,Player.player.hearts=e.hearts,Player.player.background=e.background,Player.player.purchases=e.purchases,Player.player.wallet=e.wallet,Player.player.notifications=e.notifications,Player.player.isPausedGame=e.isPausedGame,Player.player.isPro=e.isPro,Player.player.isHT=e.isHT,Player.player.isLT=e.isLT,Player.player.awards=e.awards,Player.player.level=e.level,CoinsText.text(Player.player.wallet),$(".unique-id-number").text(Player.player.id),FillHearts();let a=Announcement.message;if(null==Player.player.notifications)Player.player.notifications=[],AddNewAnnouncement(),NewAnnouncementDesign();else if(a.length>Player.player.notifications.length){NewAnnouncementDesign();let e=Player.player.notifications.length;for(let t=0;t<a.length;t++){let s=!1;for(let n=0;n<e;n++)a[t].id==Player.player.notifications[n]&&(s=!0);0==s&&Player.NotificationChecked(a[t].id)}}else RemoveNewAnnouncementDesign();ApplyMemberships(),HandleGiveAways(),HandleReferrals(),1==Player.player.isPausedGame&&PauseGame()}}function AddNewAnnouncement(){let e=Announcement.message;for(let a=0;a<e.length;a++)Player.NotificationChecked(e[a].id)}function NewAnnouncementDesign(){$(".button-announcements").addClass("make-it-ring"),$(".button-announcements").addClass("new-announcement")}function RemoveNewAnnouncementDesign(){$(".button-announcements").removeClass("make-it-ring"),$(".button-announcements").removeClass("new-announcement")}function StartGame(){Paused=!1,GameDetails.addClass("slide-down"),SliderContainer.addClass("slider-slide-up"),document.getElementById("Slider").oninput=function(){PlayerCharacter.css({left:this.value+"%",transform:"translateX(-"+this.value+"%)"})},Home.removeClass("move-main-button-away"),$(".settings").addClass("move-main-button-away"),NewWave(),GameLoopInterval=setTimeout(Loop,HighestVelocity),last_game_started=Date.now(),CounterCoinsInterval=setTimeout(CounterCoins,5e3)}function NewWave(){ClearObstacles(),CreateObstacles(),FloatObstacles(),CheckCollision()}function FillHearts(){ClearHearts();let e=Player.GetHearts();if(0==e)$(".hearts").addClass("display-none");else{$(".hearts").removeClass("display-none");for(let a=0;a<e;a++){let e=$("<span class='small-display-icon'><img src='/assets/icons/heart.svg'></span>");$(".hearts").append(e)}}}function ClearHearts(){$(".hearts").empty()}function CreateObstacles(){let e=Functions.getRandomInteger(0,3),a=Functions.getRandomInteger(0,3);for(let t=0;t<OBSTACLES;t++){let s,n=Functions.getRandomInteger(WindowHeight,OBSTACLES_MAX_Y),l=Functions.getRandomInteger(40,WindowWidth-40),i=OBSTACLES*COIN_ABUNDANCE,o=i+OBSTACLES*SHIELD_ABUNDANCE;if(t<o)t<i?s=0==e||1==e||2==e?$("<div class='obstacle coin' style='top:"+n+"px;left:"+l+"px'></div>"):$("<div class='obstacle obstacle-rock' style='top:"+n+"px;left:"+l+"px'></div>"):t>=i&&t<o&&(s=0==a?$("<div class='obstacle shield' style='top:"+n+"px;left:"+l+"px'></div>"):$("<div class='obstacle obstacle-bomb' style='top:"+n+"px;left:"+l+"px'></div>"));else{s=0==Functions.getRandomInteger(0,2)?$("<div class='obstacle obstacle-bomb' style='top:"+n+"px;left:"+l+"px'></div>"):$("<div class='obstacle obstacle-rock' style='top:"+n+"px;left:"+l+"px'></div>")}Obstacles.append(s)}}function ClearObstacles(){Obstacles.empty()}function FloatObstacles(){let e=0,a=0;$(".obstacles > .obstacle").each(function(t){let s=$(this).css("top"),n=parseInt(s.replace("px","")),l=(a=n/(TIME+SpeedIncrease))/2+1;e<l&&(e=l),$(this).css({"-webkit-transform":"translateY(-"+2*n+"px)","-moz-transform":"translateY(-"+2*n+"px)","-ms-transform":"translateY(-"+2*n+"px)","-o-transform":"translateY(-"+2*n+"px)",transform:"translateY(-"+2*n+"px)"}),$(this).css({transition:"transform "+a+"s linear 0s"})}),HighestVelocity=1e3*e,SpeedIncrease+=SPEED_INCREASE}function Loop(){if(0!=HighestVelocity&&!Paused){NewWave(),GameLoopInterval=setTimeout(Loop,HighestVelocity)}}function ClearLoop(){clearTimeout(GameLoopInterval)}function CheckCollision(){var e=$(".obstacles").children();Paused||(CheckCollisionInterval=window.setInterval(function(){var a=PlayerCharacter.width(),t=PlayerCharacter.height();let s={x:PlayerCharacter.offset().left,y:PlayerCharacter.offset().top,width:a,height:t};for(var n=0;n<e.length;n++){var l=e.eq(n),i=l.position().top,o={x:l.position().left,y:i,width:25,height:25};let a=Functions.isCollide(s,o);if(i<=-10&&$(l).remove(),!0===a)if(l.hasClass("coin")){Player.AddCoins(1);let e=Player.GetWallet();$(".coins > .small-display-text").text(e),l.remove()}else if(l.hasClass("shield")&&!PlayerCharacter.hasClass("shield-active")){PlayerCharacter.addClass("shield-active");let e=0;e=1==Player.player.isPro?shieldCounter+10:shieldCounter,$(".shields").addClass("shield-display-show"),$(".obstacles").find(".shield").remove();var r=function(){e>0?($(".player-character").hasClass("shield-animation")||$(".player-character").addClass("shield-animation"),$(".shields .small-display-text").text(e),e--,setTimeout(r,1e3)):(e=shieldCounter,$(".shields .small-display-text").text("0"),$(".shields").removeClass("shield-display-show"),PlayerCharacter.removeClass("shield-active"),$(".player-character").removeClass("shield-animation"))};setTimeout(r,1e3)}else PlayerCharacter.hasClass("shield-active")||PauseGame()}},16))}function PauseGame(){Paused=!0,ClearLoop(),sfx_on&&$(".sfx-container audio")[1].play(),$(".pause-module").addClass("pause-module-slide-up"),$(".home").addClass("move-main-button-away"),$(".settings").hasClass("move-main-button-away")||$(".settings").addClass("move-main-button-away"),GameDetails.hasClass("slide-down")||GameDetails.addClass("slide-down"),SliderContainer.removeClass("slider-slide-up"),clearInterval(CheckCollisionInterval),CheckCollisionInterval=void 0,clearInterval(CounterCoinsInterval),CounterCoinsInterval=void 0,$(".obstacles > .obstacle").each(function(e){let a=$(this).position().top;$(this).css({transition:"transform 0s linear 0s"}),$(this).css({"-webkit-transform":"translateY(0px)","-moz-transform":"translateY(0px)","-ms-transform":"translateY(0px)","-o-transform":"translateY(0px)",transform:"translateY(0px)"}),$(this).css({top:a+"px"})}),RulestoContinue()?($(".continue-game").removeClass("display-none"),$(".restart-game").addClass("display-none")):($(".continue-game").addClass("display-none"),$(".restart-game").removeClass("display-none")),Player.PausedGame()}function RulestoContinue(){return Player.GetHearts()>=1}function HandleMusic(e){music_first_time?($(".music-container audio")[0].play(),CheckMusic(e),CheckMusicInterval=setInterval(function(){CheckMusic(e)},1e3),e.text("🎵 Loading Music..."),e.addClass("pulse-animation")):(e.removeClass("pulse-animation"),e.hasClass("button-regular-off")?(e.removeClass("button-regular-off"),e.text("🎵 Music On"),$(".music-container audio")[0].play()):(e.addClass("button-regular-off"),e.text("🎵 Music Off"),$(".music-container audio")[0].pause()))}function HandleSFX(e){sfx_first_time?($(".sfx-container audio")[0].play(),$(".sfx-container audio")[1].play(),CheckSFX(e),CheckSFXInterval=setInterval(function(){CheckSFX(e)},1e3),e.text("🔈 Loading SFX..."),e.addClass("pulse-animation")):e.hasClass("button-regular-off")?(e.removeClass("button-regular-off"),e.text("🔈 SFX On"),sfx_on=!0,$(".sfx-container audio")[0].play()):(e.addClass("button-regular-off"),e.text("🔈 SFX Off"),sfx_on=!1,$(".sfx-container audio")[0].pause(),$(".sfx-container audio")[1].pause(),$(".sfx-container audio")[1].currenTime=0)}function FillShop(){FillRow(CharactersList,".characters"),FillRow(BackgroundsList,".backgrounds"),CheckSpecialHearts()}function CheckSpecialHearts(){let e=Player.GetWallet(),a=Player.GetHearts(),t=HEART_PRICE;e<t&&a<3?($(".buy-hearts-box").addClass("locked"),$(".buy-hearts-box .section-coins").text(t),$(".buy-hearts-box .section-price-icon").removeClass("display-none")):3==a?($(".buy-hearts-box").removeClass("locked"),$(".buy-hearts-box .section-coins").text("Full Hearts"),$(".buy-hearts-box .section-price-icon").addClass("display-none")):e>=t&&a<3&&($(".buy-hearts-box").removeClass("locked"),$(".buy-hearts-box .section-coins").text(t),$(".buy-hearts-box .section-price-icon").removeClass("display-none"))}function PurchaseThis(e,a,t){let s=Player.GetWallet(),n=a.find(a=>a.id===e.attr("id"));if(n.purchased)".characters"==t?Player.SetCharacter(n.id):".backgrounds"==t&&Player.SetBackground(n.id),ActivateItems();else if(s>=n.coins){$(".successful-purchase-alert").addClass("show-successful-purchase-alert"),setTimeout(function(){$(".successful-purchase-alert").removeClass("show-successful-purchase-alert")},3e3),BuyItem(n),FillShop();let e=Player.GetWallet();$(".coins > .small-display-text").text(e),ActivateItems(),FillCoinsShop()}}function FillRow(e,a){let t=$(a);t.empty();let s=Player.GetWallet();CheckPlayerPurchases(e);for(let a=0;a<e.length;a++){let n,l=$("<div id='"+e[a].id+"' class='section-box "+e[a].class+"'></div>"),i=$("<div class='section-placeholder "+e[a].class+" section-img' style='background: url("+e[a].image+") center center no-repeat;background-size:contain'></div>"),o=$("<div class='section-details'></div>"),r=$("<div class='section-name "+e[a].class+"'>"+e[a].name+"</div>");n=e[a].purchased?$("<div class='section-coins "+e[a].class+"'>"+e[a].coins+"</div>"):$("<span class='small-display-icon section-price-icon'><img src='/assets/icons/coin.svg'></span><span class='section-coins "+e[a].class+"'>"+e[a].coins+"</span>"),!e[a].purchased&&s<e[a].coins?l.addClass("locked"):l.removeClass("locked"),o.append(r),o.append(n),l.append(i),l.append(o),t.append(l)}}function CheckPlayerPurchases(e){let a=Player.GetPurchases();for(let t=0;t<e.length;t++)a.find(a=>a==e[t].id)?(e[t].purchased=!0,e[t].coins="Unlocked"):e[t].purchased=!1}function BuyItem(e){Player.AddToPurchases(e.id),Player.SubtractCoins(e.coins)}function ActivateItems(){ActivateCharacter(CharactersList),ActivateBackground(BackgroundsList)}function ActivateCharacter(e){let a=Player.GetCharacter(),t=e.find(e=>e.id==a);null!=t&&(FillRow(CharactersList,".characters"),$("#"+t.id).addClass("selected").siblings().removeClass("selected"),$("#"+t.id+" .section-coins").text("Selected"),$(".player-character img").attr("src",t.image))}function ActivateBackground(e){let a=Player.GetBackground(),t=e.find(e=>e.id==a);null!=t&&(FillRow(BackgroundsList,".backgrounds"),$("#"+t.id).addClass("selected").siblings().removeClass("selected"),$("#"+t.id+" .section-coins").text("Selected"),$(".game-container").css("background","url("+t.image+") center bottom no-repeat"),$(".game-container").css("background-size","cover"))}function FillShopHearts(){ClearShopHearts();let e=Player.GetHearts();if(0==e)$(".shop-player-stats-hearts").text("No hearts");else for(let a=0;a<e;a++){let e=$("<span class='small-display-icon'><img src='/assets/icons/heart.svg'></span>");$(".shop-player-stats-hearts").append(e)}}function ClearShopHearts(){$(".shop-player-stats-hearts").empty()}function FillCoinsShop(){let e=Player.GetWallet();$(".shop-player-stats-coins .section-coins").text(e)}function ShowAnnouncement(){let e=Announcement.message,a=$(".announcements-container");for(let t=e.length-1;t>=0;t--){let s,n=$("<div class='announcement-box'></div>"),l=$("<div class='announcement-header'>"+e[t].title+"</div>"),i=$("<img src='"+e[t].imageCover+"'>"),o=$("<div class='announcement-content'><p>"+e[t].description+"</p></div>"),r=$("<div class='announcement-date'>"+GetFormattedDate(1e3*e[t].date)+"</div>");n.append(l),n.append(r),n.append(i),n.append(o),e[t].isLinked&&(s=$("<a href='"+e[t].link+"' target='_blank'><div class='announcement-cta'>Read More →</div></a>"),n.append(s)),a.append(n)}}function GetFormattedDate(e){let a=new Date(e),t=["January","February","March","April","May","June","July","August","September","October","November","December"][a.getMonth()];return String(a.getDate()).padStart(2,"0")+" "+t+", "+a.getFullYear()}function AddPlacement(){let e=Placement.current;$(".a-placement").addClass(e.class),$(".a-placement a").attr("href",e.link),$(".a-placement-image").css({background:"url("+e.image+") center center no-repeat","background-size":"cover"}),$(".a-placement-title").text(e.title)}function ApplyMemberships(){let e=HiT.list,a=LoT.list;if(e.length>0)for(let a=0;a<e.length;a++)Player.player.id==e[a].id&&($(".pro-user").removeClass("display-none"),$(".a-placement").addClass("display-none"),$(".my-data").removeClass("display-none"),Player.player.isPro=!0,Player.player.isHT=!0,Player.player.isLT=!1);if(a.length>0)for(let e=0;e<a.length;e++)Player.player.id==a[e].id&&($(".pro-user").removeClass("display-none"),$(".a-placement").addClass("display-none"),$(".my-data").removeClass("display-none"),Player.player.isPro=!0,Player.player.isHT=!1,Player.player.isLT=!0)}function DownloadData(){var e=document.createElement("a"),a={character:Player.player.character,background:Player.player.background,wallet:Player.player.wallet,hearts:Player.player.hearts,purchases:Player.player.purchases};e.setAttribute("href","data:text/plain;charset=utf-8,"+JSON.stringify(a)),e.setAttribute("download","Droply-"+Date.now()+".json"),e.style.display="none",document.body.appendChild(e),e.click(),document.body.removeChild(e)}function CheckConnectivity(){(function(){return $.get({url:"https://droplythegame.com",dataType:"text",cache:!1})})().done(function(){$(".connectivity-alert").addClass("display-none")}).fail(function(e,a,t){$(".connectivity-alert").removeClass("display-none")})}function CounterCoins(){if(!Paused){let e=Date.now()-last_game_started,a=0,t=0;if(1==Player.player.isPro?(a=6e4,t=10):(a=12e4,t=2),e>a){Player.AddCoins(t),last_game_started=Date.now();let e=Player.GetWallet();$(".coins > .small-display-text").text(e),$(".reward-announncement-number").text(t),$(".reward-announncement").addClass("reward-announncement-appear"),setTimeout(function(){$(".reward-announncement").removeClass("reward-announncement-appear")},5e3)}CounterCoinsInterval=setTimeout(CounterCoins,5e3)}}function FillVirtualStore(){let e=$(".virtualstore"),a=VirtualStore.list;for(let t=0;t<a.length;t++){let s;s=Player.player.isHT?a[t].priceHT:Player.player.isLT?a[t].priceLT:a[t].price;let n=$("<a href='"+a[t].link+"' target='_blank'></a>"),l=$("<div id='"+a[t].id+"' class='section-box "+a[t].class+"'></div>"),i=$("<div class='section-placeholder "+a[t].class+" section-img' style='background: url("+a[t].image+") center center no-repeat;background-size:cover'></div>"),o=$("<div class='section-details'></div>"),r=$("<div class='section-name "+a[t].class+"'>"+a[t].title+"</div>"),c=$("<span class='small-display-icon section-price-icon'>💵</span><span class='section-coins "+a[t].class+"'>"+s+"</span>");o.append(r),o.append(c),l.append(i),l.append(o),n.append(l),e.append(n)}}function CheckMusic(e){4==$(".music-container audio")[0].readyState&&(music_first_time=!1,clearInterval(CheckMusicInterval),e.removeClass("button-regular-off"),e.text("🎵 Music On"),$(".music-container audio")[0].play(),e.removeClass("pulse-animation"))}function CheckSFX(e){4==$(".sfx-container audio")[0].readyState&&4==$(".sfx-container audio")[1].readyState&&(sfx_first_time=!1,clearInterval(CheckSFXInterval),e.removeClass("button-regular-off"),e.text("🔈 SFX On"),$(".sfx-container audio")[0].play(),e.removeClass("pulse-animation"))}function HandleReferrals(){let e=Ref.list,a=RefT.list,t=e.find(e=>e.id===Player.player.id),s=a.find(e=>e.id===Player.player.id);if(t){let e=SpecialCoins.GiveExtraCoins("REF01");CoinsText.text(e),$(".can-refer").addClass("display-none"),$(".refer-used").removeClass("display-none")}if(s){let e=SpecialCoins.GiveExtraCoins("REF02");CoinsText.text(e),$(".not-referred").addClass("display-none"),$(".referred").removeClass("display-none")}}function HandleGiveAways(){let e=GiveAway.list.find(e=>e.id==Player.player.id);if(e){if(0!=e.items.length)for(let a=0;a<e.items.length;a++){Player.player.purchases.find(t=>t==e.items[a])||Player.AddToPurchases(e.items[a])}if(0!=e.extracoins.length)for(let a=0;a<e.extracoins.length;a++){Player.player.purchases.find(t=>t==e.extracoins[a])||SpecialCoins.GiveExtraCoins(e.extracoins[a])}let a=Player.GetWallet();CoinsText.text(a)}}$(document).ready(function(){HandleLocalStorage(),ShowAnnouncement(),CheckConnectivity(),setInterval(CheckConnectivity,1e4),FillShop(),ActivateItems(),FillHearts(),AddPlacement(),FillVirtualStore();$(".version-release").text("droply 1.3.3"),$(".music").click(function(){HandleMusic($(this))}),$(".sfx").click(function(){HandleSFX($(this))}),$(".start").click(function(){StartGame()}),$(".ga-continue-game").click(function(){Player.RemoveHearts(1),ContinueOrRestartGame()}),$(".ga-restart-game").click(function(){Player.ResetWallet(),Player.ResetHearts(),ContinueOrRestartGame()}),Home.click(function(){Paused=!0,ClearObstacles(),ClearLoop(),SpeedIncrease=0,Home.addClass("move-main-button-away"),$(".settings").removeClass("move-main-button-away"),GameDetails.removeClass("slide-down"),SliderContainer.removeClass("slider-slide-up"),document.getElementById("Slider").value=50,PlayerCharacter.css({left:"50%",transform:"translateX(-50%)"})}),$(".button-shop").click(function(){$(".shop-window").addClass("show-shop-window");let e=Player.GetName();$(".player-name").text(e),$(".shop-player-stats").removeClass("display-none"),FillShop(),ActivateItems(),FillShopHearts(),FillCoinsShop()}),$(".shop-window-close").click(function(){$(".shop-window").removeClass("show-shop-window"),$(".shop-player-stats").addClass("display-none")}),$(".characters").on("click",".section-box",function(){PurchaseThis($(this),CharactersList,".characters")}),$(".backgrounds").on("click",".section-box",function(){PurchaseThis($(this),BackgroundsList,".backgrounds")}),$(".settings").click(function(){$(".settings-window").addClass("show-shop-window");let e=Player.GetName();$(".settings-name-change-input").val(e),$(".unique-id-number").text(Player.player.id)}),$(".settings-close").click(function(){$(".settings-window").removeClass("show-shop-window")}),$(".update-name").click(function(){let e=Player.GetName(),a=$(".settings-name-change-input").val().trim();if(""!=a&&a!=e){Functions.CheckTextHealth(a)&&(Player.SetName(a),$(".settings-window").removeClass("show-shop-window"))}}),$(".settings-clear-data").click(function(){$(".alert-modal").removeClass("display-none")}),$(".alert-cta button").click(function(){localStorage.clear(),$(".alert-modal").addClass("display-none"),$(".settings-window").removeClass("show-shop-window"),window.location.reload()}),$(".alert-cta-secondary button").click(function(){$(".alert-modal").addClass("display-none")}),$(".buy-hearts-box").click(function(){let e=Player.GetWallet(),a=Player.GetHearts(),t=HEART_PRICE;if(e>=t&&a<3){Player.AddHearts(1),Player.SubtractCoins(t);let e=Player.GetWallet();CoinsText.text(e),FillHearts(),FillShopHearts(),FillCoinsShop(),CheckSpecialHearts(),FillShop(),ActivateItems()}}),$(".button-announcements").click(function(){$(".announcement-window").addClass("show-shop-window"),RemoveNewAnnouncementDesign()}),$(".announcement-close").click(function(){$(".announcement-window").removeClass("show-shop-window")}),$(".export-my-data").click(function(){DownloadData()}),$(document).on("change",".file-upload-button",function(e){var a=new FileReader;a.onload=function(e){try{var a=JSON.parse(e.target.result);Player.player.background=a.background,Player.player.character=a.character,Player.player.wallet=a.wallet,Player.player.hearts=a.hearts,Player.player.purchases=a.purchases,Player.AddToLocalStorage(),window.location.reload()}catch(e){alert("Incorrect File Uploaded.")}},a.readAsText(e.target.files[0])})});
