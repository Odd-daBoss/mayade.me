'use strict';

function LiveCards() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.storyList0 = document.getElementById('story-list-0');
  this.imageUpload = document.getElementById('image-upload');
  this.profilePic = document.getElementById('profile-pic');
  this.profileName = document.getElementById('profile-name');
  this.signOutButton = document.getElementById('sign-out');
  this.profileChip = document.getElementById('profile-chip');
  this.addCard = document.getElementById('add-card');
  this.deleteCard = document.getElementById('del-card');
  this.inputBlock = document.getElementById('input-block');
  this.storyForm = document.getElementById('story-form');
  this.buttonMain = document.getElementById('button-main');
  this.nextButton = document.getElementById('next-button');
  this.prevButton = document.getElementById('prev-button');
  this.titleStory = document.getElementById('title-story');
  this.divTitle = document.getElementById('div-title');
  this.txtTitle = document.getElementById('txt-title');
  this.contentStory = document.getElementById('content-story');
  this.divContent = document.getElementById('div-content');
  this.txtContent = document.getElementById('txt-content');
  this.quoteStory = document.getElementById('quote-story');
  this.divQuote = document.getElementById('div-quote');
  this.txtQuote = document.getElementById('txt-quote');
  this.endingStory = document.getElementById('ending-story');
  this.divEnding = document.getElementById('div-ending');
  this.txtEnding = document.getElementById('txt-ending');
  this.functionButton = document.getElementById('function-button');
  this.scrollSwitch = document.getElementById('scroll-switch');
  this.imageSwitch = document.getElementById('image-switch');
  this.storySwitch = document.getElementById('story-switch');
  this.bottomToast = document.getElementById('bottom-toast');
  this.msgToast = document.getElementById('msg-toast');
  this.storyIcon = document.getElementById('story-icon');
  this.fastStory = document.getElementById('fast-story');
  this.imageIcon = document.getElementById('image-icon');

  this.storyForm.addEventListener('submit', this.saveStory.bind(this));
  this.addCard.addEventListener('click', this.addNewCard.bind(this));
  this.deleteCard.addEventListener('click', this.deleteNewCard.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.imageUpload.addEventListener('change', this.handleFileSelect.bind(this));
  this.nextButton.addEventListener('click', this.loopBook.bind(this));
  this.titleStory.addEventListener('focus', this.focusInput.bind(this));
  this.titleStory.addEventListener('blur', this.blurInput.bind(this));
  this.contentStory.addEventListener('focus', this.focusInput.bind(this));
  this.contentStory.addEventListener('blur', this.blurInput.bind(this));
  this.quoteStory.addEventListener('focus', this.focusInput.bind(this));
  this.quoteStory.addEventListener('blur', this.blurInput.bind(this));
  this.endingStory.addEventListener('focus', this.focusInput.bind(this));
  this.endingStory.addEventListener('blur', this.blurInput.bind(this));
  this.scrollSwitch.addEventListener('change', this.scrollMode.bind(this));
  this.imageSwitch.addEventListener('change', this.imageMode.bind(this));
  this.storySwitch.addEventListener('change', this.storyMode.bind(this));

  this.initFirebase();
  this.initBook();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
LiveCards.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

LiveCards.prototype.focusInput = function() {

};

LiveCards.prototype.blurInput = function() {

};

LiveCards.prototype.bottomToaster = function() {
  var getToaster = this.bottomToast;
  console.log(getToaster.innerHTML);
  getToaster.className = "show";
  setTimeout(function() {
    getToaster.className = getToaster.className.replace("show", "");
  }, 2300);
};

LiveCards.prototype.msgToaster = function(msg) {
  var getToaster = this.msgToast;
  if (msg) {
    getToaster.innerHTML = msg;
  }
  console.log(getToaster.innerHTML);
  getToaster.className = "show";
  setTimeout(function() {
    getToaster.className = getToaster.className.replace("show", "");
  }, 2300);
};

LiveCards.prototype.scrollMode = function() {
  if (this.scrollSwitch.checked) {
    console.log("SCROLL checked!");
    this.functionButton.removeAttribute('hidden');
  } else {
    this.functionButton.setAttribute('hidden', 'true');
  }
};

LiveCards.prototype.imageMode = function() {
  if (this.imageSwitch.checked) {
    console.log("IMG checked!");
    this.imageIcon.innerHTML = "camera_alt";
    this.imageUpload.accept = "image/*";
    this.imageUpload.capture = "camera";
  } else {
    console.log("IMG un-checked!");
    this.imageIcon.innerHTML = "image_upload";
    this.imageUpload.accept = "image/*;capture=camera";
  }
};

LiveCards.prototype.storyMode = function(event) {
  event.preventDefault();
  if (this.storySwitch.checked) {
    console.log("STORY checked!");
    this.fastStory.setAttribute('hidden', 'true');
    this.storyIcon.innerHTML = "near_me";
  } else {
    console.log("STORY un-checked!");
    this.fastStory.removeAttribute('hidden');
    this.storyIcon.innerHTML = "send";
  }
};

LiveCards.prototype.handleFileSelect = function(event) {
  event.preventDefault();
  var file = event.target.files[0];
  // Only process image files.
  if (file.type.match('image.*')) {

    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = function(e) {
      fileDisplay.innerHTML = "";

      var img = new Image();
      img.src = reader.result;
      img.id = "selected-image";

      fileDisplay.appendChild(img);
    }

    reader.readAsDataURL(file);
    return file;
  }
};

LiveCards.prototype.handleCoFileSelect = function(event) {
  event.preventDefault();
  var file = event.target.files[0];
  // Only process image files.
  if (file.type.match('image.*')) {

    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = function(e) {
      coFileDisplay.innerHTML = "";

      var img = new Image();
      img.src = reader.result;
      img.id = "selected-image";

      coFileDisplay.appendChild(img);
    }

    reader.readAsDataURL(file);
    return file;
  }
};

//Loads the stories from the bookRef - n: Lot-Size, type: init or loop.
LiveCards.prototype.initBook = function() {
  this.bookRef = this.database.ref('book-20170808165000'); // Reference to the database path.
  this.bookRef.off(); // Make sure we remove all previous listeners.
  if (!this.auth.currentUser) { // Clear User Name - if not signing in!
    this.profileName.textContent = 'Not signing in!';
  }
  // Initial Screen Display Trackers:
  var showTime = document.getElementsByClassName("now-display")[0];
  var timeDate = Date.now();
  showTime.setAttribute('id',timeDate);
  var scrX = document.getElementsByClassName("scr-display")[0];
  scrX.setAttribute('id',0); // on-Screen Display Story = 0
  var newX = document.getElementsByClassName("new-display")[0];
  newX.setAttribute('id',0); // Initial new-Story Display = 0
  // Initial loads the last number of stories and listen for new ones.
  var nextKey;
  var i = 0; // Set initial loop and initial story.
  var n = 3; // Set initial display lot.
  var keyTrk = document.getElementById('key'); // Get loop key-tracker.
  var iniStory = function(data, prevKey) {
    var recordValue = data.val();
    console.log('iniStory INIed: ' + data.key + ' PrevKEY: ' + prevKey);
    if (!prevKey) {
      console.log('!prevKey | i: ' + i);
      var looperDiv = document.getElementsByClassName("loop-tracker")[0];
      looperDiv.setAttribute('id',i);
      var nxtkeyDiv = document.getElementsByClassName("key-tracker")[0];
      nxtkeyDiv.setAttribute('id','#'+data.key);
    }
    console.log('call initDisplay: ' + data.key);
    this.initDisplay(data.key, recordValue);
  }.bind(this);

  var chgStory = function(data, prevKey) {
    var recordValue = data.val();
    console.log('chgStory CHGed: ' + data.key + ' PrevKEY: ' + prevKey);
    this.editDisplay(data.key, recordValue);
  }.bind(this);

  // Read the last (1) story and listen to: added * changed * removed.
  this.bookRef.limitToLast(n).on('child_added', iniStory);
  this.bookRef.on('child_changed', chgStory);
  this.bookRef.on('child_removed', function(data) {
    console.log('child_removed: ' + data.key);
    var child = document.getElementById(data.key);
    var parent = document.getElementById(data.key).parentNode; // Get the correct parent HERE!!
    console.log('parent: ' + parent);
    parent.removeChild(child);
    var y = document.getElementsByClassName("all-records")[0].id;
    var scrY = document.getElementsByClassName("all-records")[0];
    y--;
    scrY.setAttribute('id',y);
    var z = document.getElementsByClassName("scr-display")[0].id;
    var scrZ = document.getElementsByClassName("scr-display")[0];
    z--;
    scrZ.setAttribute('id',z);
  });

  if (keyTrk) {
    this.bookRef.once('value').then(function(snapshot) {
      var sizeDB = document.getElementsByClassName("all-records")[0];
      var m = snapshot.numChildren();
      sizeDB.setAttribute('id',m);
      var alertStory = m - i*n - 2;
      if (alertStory <= 0) {
        var loadNext = document.getElementById('load-next');
        console.log('alertStory <= 0');
      } else {
        console.log('Story: ' + alertStory);
        var prevIcon = document.getElementById('nxt-badge');
        prevIcon.setAttribute('data-badge', alertStory);
      }
    });
  }
  window.addEventListener("scroll", this.scrollLoop.bind(this), true);
};

LiveCards.prototype.scrollLoop = function(evt) {
  console.log(document.body.scrollHeight + ' - ' + window.innerHeight + ' | ' +
  document.body.scrollTop + ' * ' + document.documentElement.offsetHeight);
  if (document.body.scrollTop == document.body.scrollHeight - window.innerHeight) {
    var finTracker = document.getElementsByClassName("fin-records")[0].id; // Get finish-tracker.
    console.log('finish-tracker: ' + finTracker);
    console.log('loopBook!');
    if (!this.scrollSwitch.checked) {
      if (finTracker == 1 && this.bottomToast.innerHTML == "Loading more") {
        console.log('1+Loading more.');
        this.bottomToast.innerHTML = "The End";
      }
      this.bottomToaster();
      console.log(this.bottomToast.innerHTML)
      setTimeout(this.loopBook.bind(this), 1000);
    } else {
      if (finTracker == 1 && this.bottomToast.innerHTML == "Loading more") {
        console.log('1+Loading more.');
        this.bottomToast.innerHTML = "The End";
        return;
      }
      if (finTracker == 1 && this.bottomToast.innerHTML == "The End") {
        console.log('1+The End');
        this.bottomToaster();
        setTimeout(this.loopBook.bind(this), 1000);
      }
    }
  }
};

LiveCards.prototype.loopBook = function() {
  console.log('loop started!');
  var nextKey;
  // Reference to the /messages/ database path.
  this.bookRef = this.database.ref('book-20170808165000');
  // Make sure we remove all previous listeners.
  this.bookRef.off();
  // Clear User Name - if not signing in!
  if (!this.auth.currentUser) {
    this.profileName.textContent = 'Not signing in!';
  }
  var justScroll = false;
  var finTracker = document.getElementsByClassName("fin-records")[0].id; // Get finish-tracker.
  // If not end of page then just scroll down.
  if (document.body.scrollTop != document.body.scrollHeight - window.innerHeight) {
    window.location.href = "#enjoy-reading";
    console.log('scroll to enjoy-reading!')
    justScroll = true;
  }
  if (finTracker == 1) {
    if (this.bottomToast.innerHTML != "The End") { // Finished all records.
      this.bottomToast.innerHTML = "The End";
      return;
    }
    return;
  }
  if (justScroll) {
    return;
  }
  if (this.scrollSwitch.checked) {
    this.msgToaster("Loading more");
  }
  var n = 4; // Loads story of (n) = lot-size +1
  var i = document.getElementsByClassName("loop-tracker")[0].id; // Get loop-tracker.
  var keyTracker = document.getElementsByClassName("key-tracker")[0].id; // Get key-tracker.
  var keyID = keyTracker.substr(1);
  console.log('keyID: ' + keyID);

  var setStory = function(data, prevKey) {
    var recordValue = data.val();
    console.log('setStory Loaded: ' + data.key + ' PrevKEY: ' + prevKey);
    if (!prevKey) {
      console.log('!prevKey | i: ' + i);
      var looperDiv = document.getElementsByClassName("loop-tracker")[0];
      looperDiv.setAttribute('id',i);
      var nxtkeyDiv = document.getElementsByClassName("key-tracker")[0];
      nxtkeyDiv.setAttribute('id','#'+data.key);
    }
    console.log('call loadDisplay: ' + data.key);
    this.loadDisplay(data.key, recordValue);
  }.bind(this);

  var addStory = function(data, prevKey) {
    var recordValue = data.val();
    console.log('newStory ADDed: ' + data.key + ' PrevKEY: ' + prevKey);
    this.liveDisplay(data.key, recordValue);
  }.bind(this);

  var chgStory = function(data, prevKey) {
    var recordValue = data.val();
    console.log('chgStory CHGed: ' + data.key + ' PrevKEY: ' + prevKey);
    this.editDisplay(data.key, recordValue);
  }.bind(this);

  i++; // Read block of (n) stories.
  this.bookRef.orderByKey().endAt(keyID).limitToLast(n).on('child_added', setStory);
  this.bookRef.once('value').then(function(snapshot) {
    var sizeDB = document.getElementsByClassName("all-records")[0];
    var m = snapshot.numChildren();
    sizeDB.setAttribute('id',m);
    var alertStory = m - i*n;
    if (alertStory <= 0) {
      var loadNext = document.getElementById('load-next');
      console.log('alertStory <= 0 | ' + alertStory);
    } else {
      console.log('Story: ' + alertStory);
      var prevIcon = document.getElementById('nxt-badge');
      prevIcon.setAttribute('data-badge', alertStory);
    }
  });
  // Listen to: newly added * changed * removed.
  this.bookRef.limitToLast(1).on('child_added', addStory);
  this.bookRef.on('child_changed', chgStory);
  this.bookRef.on('child_removed', function(data) {
    console.log('child_removed: ' + data.key);
    var child = document.getElementById(data.key);
    var parent = document.getElementById(data.key).parentNode; // Get the correct parent HERE!!
    console.log('parent: ' + parent);
    parent.removeChild(child);
    var y = document.getElementsByClassName("all-records")[0].id;
    var scrY = document.getElementsByClassName("all-records")[0];
    y--;
    scrY.setAttribute('id',y);
    var z = document.getElementsByClassName("scr-display")[0].id;
    var scrZ = document.getElementsByClassName("scr-display")[0];
    z--;
    scrZ.setAttribute('id',z);
  });
};

// Template for Stories: A Story Template
LiveCards.STORY_TEMPLATE =
  '<div class="section--center mdl-grid mdl-grid--no-spacing mdl-shadow--2dp">' +
    '<div class="mdl-card mdl-cell mdl-cell--12-col">' +
      '<figure class="storyImage mdl-card__media">' +
      '</figure>' +
      '<div class="mdl-card__title">' +
        '<h1 class="title mdl-card__title-text mdl-color-text--blue-grey-300"></h1>' +
      '</div>' +
      '<div class="users-container">' +
        '<span class="mdl-chip mdl-chip--contact">' +
          '<span class="mdl-chip__contact user-pic"></span>' +
          '<span class="mdl-chip__text user-name"></span>' +
        '</span>' +
        '<span class="mdl-chip mdl-chip--contact">' +
          '<span class="mdl-chip__contact user-pic"></span>' +
          '<span class="mdl-chip__text user-name"></span>' +
        '</span>' +
        '<span class="mdl-chip mdl-chip--contact">' +
          '<span class="mdl-chip__contact user-pic"></span>' +
          '<span class="mdl-chip__text user-name"></span>' +
        '</span>' +
        '<span class="mdl-chip mdl-chip--contact">' +
          '<span class="mdl-chip__contact user-pic"></span>' +
          '<span class="mdl-chip__text user-name"></span>' +
        '</span>' +
        '<span class="mdl-chip mdl-chip--contact">' +
          '<span class="mdl-chip__contact user-pic"></span>' +
          '<span class="mdl-chip__text user-name"></span>' +
        '</span>' +
        '<button class="co-writer mdl-button mdl-button--icon mdl-button--colored" hidden><i class="material-icons">person_add</i></button>' +
      '</div>' +
      '<div class="mdl-card__supporting-text">' +
        '<p class="content"></p>' +
        '<div class="w3-panel w3-leftbar">' +
        '<p><i class="fa fa-quote-right w3-xlarge"></i><br>' +
        '<i class="w3-serif w3-large quote"></i></p>' +
        '</div>' +
        '<p class="ending"></p>' +
      '</div>' +
      '<div class="mdl-card__actions mdl-card--border">' +
          '<span class="mdl-chip">' +
            '<span class="dateTime mdl-chip__text" hidden></span>' +
            '<span class="readTime mdl-chip__text"></span>' +
          '</span>' +
        '<div class="mdl-layout-spacer"></div>' +
        '<span class="mdl-badge mdl-badge--no-background like-badge" data-badge="0"></span>' +
        '<button class="like-button mdl-button mdl-button--icon mdl-button--colored"><i class="material-icons">favorite</i></button>' +
      '</div>' +
      '<div class="mdl-card__menu">' +
          '<button class="share-button mdl-button mdl-button--icon mdl-button--colored"><i class="material-icons">share</i></button>' +
      '</div>' +
    '</div>' +
  '</div>';

LiveCards.IMAGE_PROGRESSBAR =
  '<div class="materialBar">' +
  '<div class="mdl-progress mdl-js-progress mdl-progress__indeterminate is-upgraded" data-upgraded=",MaterialProgress" style="width: 100%">' +
    '<div class="progressbar bar bar1" style="width: 0%;"></div>' +
    '<div class="bufferbar bar bar2" style="width: 100%;"></div>' +
    '<div class="auxbar bar bar3" style="width: 0%;"></div>' +
  '</div>' +
  '</div>';

// Displays a Story in the UI.
LiveCards.prototype.initDisplay = function(key, value) {
  console.log('key* :' + key);
  console.log('title* :' + value.title);
  var div = document.getElementById(key);
  var storyDate = value.date;
  // If an element for that story does not exists yet we create it.
  if (!div) { //Displaying new story.
    var fDate = document.getElementById("story-list-0").getElementsByClassName("dateTime")[0];
    if (fDate) {
      var firstDate = fDate.innerHTML;
    } else {
      firstDate = 0;
    }
    var container = document.createElement("DIV");
    container.innerHTML = LiveCards.STORY_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    div.getElementsByClassName("user-pic")[0].style.backgroundImage = 'url(' + value.photoUrl + ')';
    div.getElementsByClassName("user-name")[0].innerHTML = value.name;
    div.getElementsByClassName("dateTime")[0].innerHTML = value.date;
    div.getElementsByClassName("readTime")[0].innerHTML = value.ddmmyy;
    if (storyDate > firstDate) {
      this.msgToaster("Adding story");
      if (!this.scrollSwitch.checked) {
        scroll(0,0);
      }
      this.storyList0.insertBefore(div,this.storyList0.firstChild);
    } else {
      this.storyList0.appendChild(div);
    }
    var showDate = document.getElementsByClassName("now-display")[0].id;
    if (storyDate > showDate) {
      var x = document.getElementsByClassName("all-records")[0].id;
      var scrX = document.getElementsByClassName("all-records")[0];
      x++;
      scrX.setAttribute('id',x);
    } else {
      var z = document.getElementsByClassName("scr-display")[0].id;
      var scrZ = document.getElementsByClassName("scr-display")[0];
      z++;
      scrZ.setAttribute('id',z);
    }
  }
  var likeMe = div.getElementsByClassName("like-button")[0];
  likeMe.setAttribute('id', 'lk.'+key);
  var badgeMe = div.getElementsByClassName("like-badge")[0];
  badgeMe.setAttribute('id', 'bg.'+key);
  var shareMe = div.getElementsByClassName("share-button")[0];
  shareMe.setAttribute('id', 'sh.'+key);
  var coWriteMe = div.getElementsByClassName("co-writer")[0];
  coWriteMe.setAttribute('id', 'co.'+key);
  if (!value.imageUri) { // If the story has NO-image.
      div.getElementsByClassName("storyImage")[0].innerHTML = '';
      console.log('coWrite-no-hidden!');
      coWriteMe.removeAttribute('hidden');
  } else { // If the story has an image.
    div.getElementsByClassName("storyImage")[0].innerHTML = LiveCards.IMAGE_PROGRESSBAR;
    var image = document.createElement('img');
    image.addEventListener('load', function() {
      // Remove MDL Progress Bar when done!
      div.getElementsByClassName("materialBar")[0].innerHTML = '';
    }.bind(this));
    this.setImageUri(value.imageUri, image);
    div.getElementsByClassName("storyImage")[0].appendChild(image);
  }
  if (!value.title) { // If the story has NO-title.
    div.getElementsByClassName("title")[0].innerHTML = '';
    console.log('coWrite-no-hidden!');
    coWriteMe.removeAttribute('hidden');
  } else { // If the story has a title.
    var htmlTitle = value.title.replace(/\n/g, '<br>');
    div.getElementsByClassName("title")[0].innerHTML = htmlTitle;
  }
  if (!value.content) { // If the story has NO-content.
    div.getElementsByClassName("content")[0].innerHTML = '';
    console.log('coWrite-no-hidden!');
    coWriteMe.removeAttribute('hidden');
  } else { // If the story has a content.
    var htmlContent = value.content.replace(/\n/g, '<br>');
    div.getElementsByClassName("content")[0].innerHTML = htmlContent;
  }
  if (!value.quote) { // If the story has NO-quote.
    div.getElementsByClassName("w3-panel")[0].setAttribute('hidden', 'true');
    console.log('coWrite-no-hidden!');
    coWriteMe.removeAttribute('hidden');
  } else { // If the story has a quote.
    var htmlQuote = value.quote.replace(/\n/g, '<br>');
    div.getElementsByClassName("quote")[0].innerHTML = htmlQuote;
  }
  if (!value.ending) { // If the story has NO-ending.
    div.getElementsByClassName("ending")[0].innerHTML = '';
    console.log('coWrite-no-hidden!');
    coWriteMe.removeAttribute('hidden');
  } else { // If the story has a ending.
    var htmlEnding = value.ending.replace(/\n/g, '<br>');
    div.getElementsByClassName("ending")[0].innerHTML = htmlEnding;
  }
  if (!value.coWriterA) {
    div.getElementsByClassName("mdl-chip")[1].setAttribute('hidden', 'true');
    div.getElementsByClassName("mdl-chip")[2].setAttribute('hidden', 'true');
    div.getElementsByClassName("mdl-chip")[3].setAttribute('hidden', 'true');
    div.getElementsByClassName("mdl-chip")[4].setAttribute('hidden', 'true');
  } else {
    div.getElementsByClassName("user-pic")[1].style.backgroundImage = 'url(' + value.photoUrlA + ')';
    div.getElementsByClassName("user-name")[1].innerHTML = value.coWriterA;
  }
  if (!value.coWriterB) {
    div.getElementsByClassName("mdl-chip")[2].setAttribute('hidden', 'true');
    div.getElementsByClassName("mdl-chip")[3].setAttribute('hidden', 'true');
    div.getElementsByClassName("mdl-chip")[4].setAttribute('hidden', 'true');
  } else {
    div.getElementsByClassName("user-pic")[2].style.backgroundImage = 'url(' + value.photoUrlB + ')';
    div.getElementsByClassName("user-name")[2].innerHTML = value.coWriterB;
  }
  if (!value.coWriterC) {
    div.getElementsByClassName("mdl-chip")[3].setAttribute('hidden', 'true');
    div.getElementsByClassName("mdl-chip")[4].setAttribute('hidden', 'true');
  } else {
    div.getElementsByClassName("user-pic")[3].style.backgroundImage = 'url(' + value.photoUrlC + ')';
    div.getElementsByClassName("user-name")[3].innerHTML = value.coWriterC;
  }
  if (!value.coWriterD) {
    div.getElementsByClassName("mdl-chip")[4].setAttribute('hidden', 'true');
  } else {
    div.getElementsByClassName("user-pic")[4].style.backgroundImage = 'url(' + value.photoUrlD + ')';
    div.getElementsByClassName("user-name")[4].innerHTML = value.coWriterD;
  }
};

// Displays a Story in the UI.
LiveCards.prototype.loadDisplay = function(key, value) {
  var m = document.getElementsByClassName("all-records")[0].id;
  var n = document.getElementsByClassName("scr-display")[0].id;
  var finish = document.getElementsByClassName("fin-records")[0].id;
  var loadLeft = m - n;
  console.log('loadLeft: ' + loadLeft);
  if (loadLeft >= 0 && finish != 1) {
    if (loadLeft == 0) {
      var finishRecords = document.getElementsByClassName("fin-records")[0];
      finishRecords.setAttribute('id',1);
      console.log(finishRecords);
    }
    var showList = document.getElementById("happy-beginning");
    var i = document.getElementsByClassName("loop-tracker")[0].id; // Get loop-tracker.
    var listName = "story-list-" + i;
    console.log('create name: ' + listName);
    var loopList = document.getElementById(listName); // Get "story-list-i"
    if (!loopList) { // If no story-list-i, create now!
      loopList = document.createElement("DIV");
      loopList.setAttribute('id', listName);
      showList.appendChild(loopList);
    }
    loopList.scrollIntoView();
    var div = document.getElementById(key); // Get story div.
    var storyDate = value.date; // Get story date.
    if (!div) { // If an element for that story does not exists yet we create it.
      var fDate = document.getElementById(listName).getElementsByClassName("dateTime")[0];
      if (fDate) {
        var firstDate = fDate.innerHTML;
      } else {
        firstDate = 0;
      }
      if (storyDate > firstDate) {
        var container = document.createElement("DIV");
        container.innerHTML = LiveCards.STORY_TEMPLATE;
        div = container.firstChild;
        div.setAttribute('id', key);
        div.getElementsByClassName("user-pic")[0].style.backgroundImage = 'url(' + value.photoUrl + ')';
        div.getElementsByClassName("user-name")[0].innerHTML = value.name;
        div.getElementsByClassName("dateTime")[0].innerHTML = value.date;
        div.getElementsByClassName("readTime")[0].innerHTML = value.ddmmyy;
        var likeMe = div.getElementsByClassName("like-button")[0];
        likeMe.setAttribute('id', 'lk.'+key);
        var badgeMe = div.getElementsByClassName("like-badge")[0];
        badgeMe.setAttribute('id', 'bg.'+key);
        var shareMe = div.getElementsByClassName("share-button")[0];
        shareMe.setAttribute('id', 'sh.'+key);
        var coWriteMe = div.getElementsByClassName("co-writer")[0];
        coWriteMe.setAttribute('id', 'co.'+key);
        loopList.insertBefore(div,loopList.firstChild);
        var z = document.getElementsByClassName("scr-display")[0].id;
        var scrZ = document.getElementsByClassName("scr-display")[0];
        z++;
        scrZ.setAttribute('id',z);
        if (!value.imageUri) { // If the story has NO-image.
          div.getElementsByClassName("storyImage")[0].innerHTML = '';
          coWriteMe.removeAttribute('hidden');
        } else { // If the story has an image.
          div.getElementsByClassName("storyImage")[0].innerHTML = LiveCards.IMAGE_PROGRESSBAR;
          var image = document.createElement('img');
          image.addEventListener('load', function() {
            // Remove MDL Progress Bar when done!
            div.getElementsByClassName("materialBar")[0].innerHTML = '';
          }.bind(this));
          this.setImageUri(value.imageUri, image);
          div.getElementsByClassName("storyImage")[0].appendChild(image);
        }
        if (!value.title) { // If the story has NO-title.
          div.getElementsByClassName("title")[0].innerHTML = '';
          coWriteMe.removeAttribute('hidden');
        } else { // If the story has a title.
          var htmlTitle = value.title.replace(/\n/g, '<br>');
          div.getElementsByClassName("title")[0].innerHTML = htmlTitle;
        }
        if (!value.content) { // It the story has NO-content.
          div.getElementsByClassName("content")[0].innerHTML = '';
          coWriteMe.removeAttribute('hidden');
        } else { // It the story has a content.
          var htmlContent = value.content.replace(/\n/g, '<br>');
          div.getElementsByClassName("content")[0].innerHTML = htmlContent;
        }
        if (!value.quote) { // If the story has NO-quote.
          div.getElementsByClassName("w3-panel")[0].setAttribute('hidden', 'true');
          coWriteMe.removeAttribute('hidden');
        } else { // If the story has a quote.
          var htmlQuote = value.quote.replace(/\n/g, '<br>');
          div.getElementsByClassName("quote")[0].innerHTML = htmlQuote;
        }
        if (!value.ending) { // If the story has NO-ending.
          div.getElementsByClassName("ending")[0].innerHTML = '';
          coWriteMe.removeAttribute('hidden');
        } else { // If the story has a ending.
          var htmlEnding = value.ending.replace(/\n/g, '<br>');
          div.getElementsByClassName("ending")[0].innerHTML = htmlEnding;
        }
        if (!value.coWriterA) {
          div.getElementsByClassName("mdl-chip")[1].setAttribute('hidden', 'true');
          div.getElementsByClassName("mdl-chip")[2].setAttribute('hidden', 'true');
          div.getElementsByClassName("mdl-chip")[3].setAttribute('hidden', 'true');
          div.getElementsByClassName("mdl-chip")[4].setAttribute('hidden', 'true');
        } else {
          div.getElementsByClassName("user-pic")[1].style.backgroundImage = 'url(' + value.photoUrlA + ')';
          div.getElementsByClassName("user-name")[1].innerHTML = value.coWriterA;
        }
        if (!value.coWriterB) {
          div.getElementsByClassName("mdl-chip")[2].setAttribute('hidden', 'true');
          div.getElementsByClassName("mdl-chip")[3].setAttribute('hidden', 'true');
          div.getElementsByClassName("mdl-chip")[4].setAttribute('hidden', 'true');
        } else {
          div.getElementsByClassName("user-pic")[2].style.backgroundImage = 'url(' + value.photoUrlB + ')';
          div.getElementsByClassName("user-name")[2].innerHTML = value.coWriterB;
        }
        if (!value.coWriterC) {
          div.getElementsByClassName("mdl-chip")[3].setAttribute('hidden', 'true');
          div.getElementsByClassName("mdl-chip")[4].setAttribute('hidden', 'true');
        } else {
          div.getElementsByClassName("user-pic")[3].style.backgroundImage = 'url(' + value.photoUrlC + ')';
          div.getElementsByClassName("user-name")[3].innerHTML = value.coWriterC;
        }
        if (!value.coWriterD) {
          div.getElementsByClassName("mdl-chip")[4].setAttribute('hidden', 'true');
        } else {
          div.getElementsByClassName("user-pic")[4].style.backgroundImage = 'url(' + value.photoUrlD + ')';
          div.getElementsByClassName("user-name")[4].innerHTML = value.coWriterD;
        }
      }
    }
  }
};

// Displays a Story in the UI.
LiveCards.prototype.liveDisplay = function(key, value) {
  console.log('live key* :' + key);
  console.log('live title* :' + value.title);
  var div = document.getElementById(key);
  var storyDate = value.date; // If an element for that story does not exists yet we create it.
  if (!div) { //Displaying new story.
    var fDate = document.getElementById("story-list-0").getElementsByClassName("dateTime")[0];
    if (fDate) {
      var firstDate = fDate.innerHTML;
    } else {
      firstDate = 0;
    }
    var container = document.createElement("DIV");
    container.innerHTML = LiveCards.STORY_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    div.getElementsByClassName("user-name")[0].style.backgroundImage = 'url(' + value.photoUrl + ')';
    div.getElementsByClassName("user-pic")[0].innerHTML = value.name;
    div.getElementsByClassName("dateTime")[0].innerHTML = value.date;
    div.getElementsByClassName("readTime")[0].innerHTML = value.ddmmyy;
    if (storyDate > firstDate) {
      if (document.body.scrollTop > 0) {
        this.msgToaster("Adding story");
        if (!this.scrollSwitch.checked) {
          scroll(0,0);
        }
      }
      this.storyList0.insertBefore(div,this.storyList0.firstChild);
    } else {
      this.msgToaster("Loading more");
      this.storyList0.appendChild(div);
    }
    var showDate = document.getElementsByClassName("now-display")[0].id;
    if (storyDate > showDate) {
      var x = document.getElementsByClassName("all-records")[0].id;
      var scrX = document.getElementsByClassName("all-records")[0];
      x++;
      scrX.setAttribute('id',x);
    } else {
      var z = document.getElementsByClassName("scr-display")[0].id;
      var scrZ = document.getElementsByClassName("scr-display")[0];
      z++;
      scrZ.setAttribute('id',z);
    }
  }
  var likeMe = div.getElementsByClassName("like-button")[0];
  likeMe.setAttribute('id', 'lk.'+key);
  var badgeMe = div.getElementsByClassName("like-badge")[0];
  badgeMe.setAttribute('id', 'bg.'+key);
  var shareMe = div.getElementsByClassName("share-button")[0];
  shareMe.setAttribute('id', 'sh.'+key);
  var coWriteMe = div.getElementsByClassName("co-writer")[0];
  coWriteMe.setAttribute('id', 'co.'+key);
  if (!value.imageUri) { // If the story has NO-image.
      div.getElementsByClassName("storyImage")[0].innerHTML = '';
      coWriteMe.removeAttribute('hidden');
  } else { // If the story has an image.
    div.getElementsByClassName("storyImage")[0].innerHTML = LiveCards.IMAGE_PROGRESSBAR;
    var image = document.createElement('img');
    image.addEventListener('load', function() {
      // Remove MDL Progress Bar when done!
      div.getElementsByClassName("materialBar")[0].innerHTML = '';
    }.bind(this));
    this.setImageUri(value.imageUri, image);
    div.getElementsByClassName("storyImage")[0].appendChild(image);
  }
  if (!value.title) { // If the story has NO-title.
    div.getElementsByClassName("title")[0].innerHTML = '';
    coWriteMe.removeAttribute('hidden');
  } else { // If the story has a title.
    var htmlTitle = value.title.replace(/\n/g, '<br>');
    div.getElementsByClassName("title")[0].innerHTML = htmlTitle;
  }
  if (!value.content) { // It the story has NO-content.
    div.getElementsByClassName("content")[0].innerHTML = '';
    coWriteMe.removeAttribute('hidden');
  } else { // It the story has a content.
    var htmlContent = value.content.replace(/\n/g, '<br>');
    div.getElementsByClassName("content")[0].innerHTML = htmlContent;
  }
  if (!value.quote) { // If the story has NO-quote.
    div.getElementsByClassName("w3-panel")[0].setAttribute('hidden', 'true');
    coWriteMe.removeAttribute('hidden');
  } else { // If the story has a quote.
    var htmlQuote = value.quote.replace(/\n/g, '<br>');
    div.getElementsByClassName("quote")[0].innerHTML = htmlQuote;
  }
  if (!value.ending) { // If the story has NO-ending.
    div.getElementsByClassName("ending")[0].innerHTML = '';
    coWriteMe.removeAttribute('hidden');
  } else { // If the story has a ending.
    var htmlEnding = value.ending.replace(/\n/g, '<br>');
    div.getElementsByClassName("ending")[0].innerHTML = htmlEnding;
  }
  if (!value.coWriterA) {
    div.getElementsByClassName("mdl-chip")[1].setAttribute('hidden', 'true');
    div.getElementsByClassName("mdl-chip")[2].setAttribute('hidden', 'true');
    div.getElementsByClassName("mdl-chip")[3].setAttribute('hidden', 'true');
    div.getElementsByClassName("mdl-chip")[4].setAttribute('hidden', 'true');
  } else {
    div.getElementsByClassName("user-pic")[1].style.backgroundImage = 'url(' + value.photoUrlA + ')';
    div.getElementsByClassName("user-name")[1].innerHTML = value.coWriterA;
  }
  if (!value.coWriterB) {
    div.getElementsByClassName("mdl-chip")[2].setAttribute('hidden', 'true');
    div.getElementsByClassName("mdl-chip")[3].setAttribute('hidden', 'true');
    div.getElementsByClassName("mdl-chip")[4].setAttribute('hidden', 'true');
  } else {
    div.getElementsByClassName("user-pic")[2].style.backgroundImage = 'url(' + value.photoUrlB + ')';
    div.getElementsByClassName("user-name")[2].innerHTML = value.coWriterB;
  }
  if (!value.coWriterC) {
    div.getElementsByClassName("mdl-chip")[3].setAttribute('hidden', 'true');
    div.getElementsByClassName("mdl-chip")[4].setAttribute('hidden', 'true');
  } else {
    div.getElementsByClassName("user-pic")[3].style.backgroundImage = 'url(' + value.photoUrlC + ')';
    div.getElementsByClassName("user-name")[3].innerHTML = value.coWriterC;
  }
  if (!value.coWriterD) {
    div.getElementsByClassName("mdl-chip")[4].setAttribute('hidden', 'true');
  } else {
    div.getElementsByClassName("user-pic")[4].style.backgroundImage = 'url(' + value.photoUrlD + ')';
    div.getElementsByClassName("user-name")[4].innerHTML = value.coWriterD;
  }
};

// Correcting Displayed Story in the UI.
LiveCards.prototype.editDisplay = function(key, value) {
  var div = document.getElementById(key);
  if (div) {
    if (!value.imageUri) { // If the story has NO-image.
      div.getElementsByClassName("storyImage")[0].innerHTML = '';
    } else { // If the story has an image.
      div.getElementsByClassName("storyImage")[0].innerHTML = LiveCards.IMAGE_PROGRESSBAR;
      var image = document.createElement('img');
      image.addEventListener('load', function() {
        // Remove MDL Progress Bar when done!
        div.getElementsByClassName("materialBar")[0].innerHTML = '';
      }.bind(this));
      this.setImageUri(value.imageUri, image);
      div.getElementsByClassName("storyImage")[0].appendChild(image);
    }
    if (!value.title) { // If the story has NO-title.
      div.getElementsByClassName("title")[0].innerHTML = '';
    } else { // If the story has a title.
      var htmlTitle = value.title.replace(/\n/g, '<br>');
      div.getElementsByClassName("title")[0].innerHTML = htmlTitle;
    }
    if (!value.content) { // It the story has NO-content.
      div.getElementsByClassName("content")[0].innerHTML = '';
    } else { // It the story has a content.
      var htmlContent = value.content.replace(/\n/g, '<br>');
      div.getElementsByClassName("content")[0].innerHTML = htmlContent;
    }
    if (!value.quote) { // If the story has NO-quote.
      div.getElementsByClassName("w3-panel")[0].setAttribute('hidden', 'true');
    } else { // If the story has a quote.
      var htmlQuote = value.quote.replace(/\n/g, '<br>');
      div.getElementsByClassName("quote")[0].innerHTML = htmlQuote;
    }
    if (!value.ending) { // If the story has NO-ending.
      div.getElementsByClassName("ending")[0].innerHTML = '';
    } else { // If the story has a ending.
      var htmlEnding = value.ending.replace(/\n/g, '<br>');
      div.getElementsByClassName("ending")[0].innerHTML = htmlEnding;
    }
  }
};

//Add a new card.
LiveCards.prototype.addNewCard = function() {
  scroll(0,0);
  if (this.auth.currentUser) {
    this.inputBlock.removeAttribute('hidden');
    this.functionButton.setAttribute('hidden', 'true');
    var currentUser = this.auth.currentUser;
    var div = document.getElementsByClassName("users-container")[0];
    div.getElementsByClassName("user-pic")[4].style.backgroundImage = 'url(' + currentUser.photoURL + ')';
    div.getElementsByClassName("user-name")[4].innerHTML = currentUser.displayName;
    div.getElementsByClassName("mdl-chip")[4].removeAttribute('hidden');
  } else {
    this.signIn();
  }
};

//Delete the new card, clear image and form!!
LiveCards.prototype.deleteNewCard = function() {
    var div = document.getElementsByClassName("users-container")[0];
    for (var i = 0; i < 5; i++) {
      div.getElementsByClassName("mdl-chip")[i].setAttribute('hidden', 'true');
      div.getElementsByClassName("user-pic")[i].style.backgroundImage =
        "url('./images/profile_placeholder.svg')";
      div.getElementsByClassName("user-name")[i].innerHTML = "";
    }
    fileDisplay.innerHTML = "";
    this.storyForm.reset();
    this.divTitle.innerHTML = "";
    this.divTitle.removeAttribute('hidden');
    this.txtTitle.removeAttribute('hidden');
    this.divContent.innerHTML = "";
    this.divContent.removeAttribute('hidden');
    this.txtContent.removeAttribute('hidden');
    this.divQuote.innerHTML = "";
    this.divQuote.removeAttribute('hidden');
    this.txtQuote.removeAttribute('hidden');
    this.divEnding.innerHTML = "";
    this.divEnding.removeAttribute('hidden');
    this.txtEnding.removeAttribute('hidden');
    this.inputBlock.setAttribute('hidden', 'true');
    if (this.scrollSwitch.checked) {
      this.functionButton.removeAttribute('hidden');
    }
};

// Sets the URL of the given img element with the URL of the image stored in Cloud Storage.
LiveCards.prototype.setImageUri = function(imageUri, imgElement) {
  // If the image is a Cloud Storage URI we fetch the URL.
  if (imageUri.startsWith('gs://')) {
    this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
      imgElement.src = metadata.downloadURLs[0];
    });
  } else {
    imgElement.src = imageUri;
  }
};

// Saves a new story on the Firebase DB.
LiveCards.prototype.saveStory = function(event) {
  if (this.auth.currentUser) {
    event.preventDefault();

    var div = document.getElementsByClassName("users-container")[0];
    var chkPict = [];
    var chkName = [];
    for (var i = 0; i < 5; i++) {
      if (div.getElementsByClassName("user-name")[i].innerHTML === "") {
        chkPict[i] = div.getElementsByClassName("user-pic")[4].style.backgroundImage;
        chkName[i] = div.getElementsByClassName("user-name")[4];
        for (var x = i+1; x < 5; x++) {
          chkPict[x] = "";
          chkName[x] = "";
        }
        i = 5;
      } else {
        chkPict[i] = div.getElementsByClassName("user-pic")[i].style.backgroundImage;
        chkName[i] = div.getElementsByClassName("user-name")[i];
      }
    }
    var file = this.imageUpload.files[0];
    if (file) {
      // Check that the user uploaded image or entered a title or any contents.
      if (this.imageUpload.value || this.titleStory.value || this.contentStory.value
          || this.quoteStory.value || this.endingStory.value) {
        var currentUser = this.auth.currentUser;
        var d = Date.now();
        var e = Date();
        // Add a new message entry to the Firebase Database.
        this.bookRef = this.database.ref('book-20170808165000');
        this.bookRef.push({
          name: chkName[0],
          photoUrl: chkPict[0] || './images/profile_placeholder.svg',
          coWriterA: chkName[1],
          photoUrlA: chkPict[1] || './images/profile_placeholder.svg',
          coWriterB: chkName[2],
          photoUrlB: chkPict[2] || './images/profile_placeholder.svg',
          coWriterC: chkName[3],
          photoUrlC: chkPict[3] || './images/profile_placeholder.svg',
          coWriterD: chkName[4],
          photoUrlD: chkPict[4] || './images/profile_placeholder.svg',
          title: this.titleStory.value,
          content: this.contentStory.value,
          quote: this.quoteStory.value,
          ending: this.endingStory.value,
          date: d,
          ddmmyy: e
        }).then(function(data) {
          // Clear input new story card and (-1) this new story.
          this.deleteNewCard();
          var z = document.getElementsByClassName("new-display")[0].id;
          var scrZ = document.getElementsByClassName("new-display")[0];
          z--;
          scrZ.setAttribute('id',z);

          // Upload the image to Cloud Storage.
          var filePath = currentUser.uid + '/' + data.key + '/' + file.name;
          return this.storage.ref(filePath).put(file).then(function(snapshot) {
            // Get the file's Storage URI and update the chat message placeholder.
            var fullPath = snapshot.metadata.fullPath;
            return data.update({imageUri: this.storage.ref(fullPath).toString()});
            }.bind(this));
          }.bind(this)).catch(function(error) {
              console.error('There was an error uploading a file to Cloud Storage:', error);
            });
        this.functionButton.removeAttribute('hidden');
      }
    } else {
      // If no image uploaded - check if user entered a title or any contents.
      if (this.titleStory.value || this.contentStory.value || this.quoteStory.value
          || this.endingStory.value) {
        var currentUser = this.auth.currentUser;
        var d = Date.now();
        var e = Date();
        // Add a new message entry to the Firebase Database.
        this.bookRef = this.database.ref('book-20170808165000');
        this.bookRef.push({
          name: chkName[0],
          photoUrl: chkPict[0] || './images/profile_placeholder.svg',
          coWriterA: chkName[1],
          photoUrlA: chkPict[1] || './images/profile_placeholder.svg',
          coWriterB: chkName[2],
          photoUrlB: chkPict[2] || './images/profile_placeholder.svg',
          coWriterC: chkName[3],
          photoUrlC: chkPict[3] || './images/profile_placeholder.svg',
          coWriterD: chkName[4],
          photoUrlD: chkPict[4] || './images/profile_placeholder.svg',
          title: this.titleStory.value,
          content: this.contentStory.value,
          quote: this.quoteStory.value,
          ending: this.endingStory.value,
          date: d,
          ddmmyy: e
        }).then(function() {
            // Clear input new story card and (-1) this new story.
            this.deleteNewCard();
            var z = document.getElementsByClassName("new-display")[0].id;
            var scrZ = document.getElementsByClassName("new-display")[0];
            z--;
            scrZ.setAttribute('id',z);
          }.bind(this)).catch(function(error) {
              console.error('Error writing new message to Firebase Database', error);
            });
        this.functionButton.removeAttribute('hidden');
      }
    }
  } else {
    alert("You must sign-in first!");
  }
};

// Signs-in Live Cards.
LiveCards.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/plus.login');
  this.auth.signInWithRedirect(provider);
};

// Signs-out of Live Cards.
LiveCards.prototype.signOut = function() {
  if (this.profileName.textContent == 'Not signing in!') {
    this.profileChip.setAttribute('hidden', 'true');
    var loopMoreButton = document.getElementById("loop-more");
    loopMoreButton.className = "add-padding";
  } else {
    // Clear form and Sign out of Firebase.
    this.auth.signOut();
    this.msgToaster("Signing out.");
    this.profilePic.style.backgroundImage = "url('./images/profile_placeholder.svg')";
    this.profileName.textContent = 'Not signing in!';
    this.deleteNewCard();
    if (this.buttonMain.innerHTML == "create") {
      this.buttonMain.innerHTML = "lock";
    }
  }
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
LiveCards.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL; // Only change these two lines!
    var profileName = user.displayName;   // Only change these two lines!

    // Set the user's profile pic and name.
    this.profilePic.style.backgroundImage = 'url(' + profilePicUrl + ')';
    this.profileName.textContent = profileName;
    this.profileChip.removeAttribute('hidden');
    var loopMoreButton = document.getElementById("loop-more");
    loopMoreButton.className = loopMoreButton.className.replace("add-padding", "");
    if (this.buttonMain.innerHTML == "lock") {
      this.buttonMain.innerHTML = "create";
    }
  } else { // User is signed out!
    // Hide the input form.
    this.inputBlock.setAttribute('hidden', 'true');
    this.functionButton.removeAttribute('hidden');
    if (this.buttonMain.innerHTML == "create") {
      this.buttonMain.innerHTML = "lock";
    }
  }
};

// Checks that the Firebase SDK has been correctly setup and configured.
LiveCards.prototype.checkSetup = function() {

  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

LiveCards.prototype.coWritingClick = function(clickID) {
  console.log("coWriter: " + clickID.substr(3));
  if (!this.auth.currentUser) {
    this.signIn();
  } else {
    this.deleteNewCard();
    scroll(0,0);
    this.inputBlock.removeAttribute('hidden');
    this.functionButton.setAttribute('hidden', 'true');
    this.dataRef = this.database.ref('book-20170808165000/' + clickID.substr(3));
    this.dataRef.once('value').then(function(snapshot) {
      var recordName = (snapshot.val().name);
      var recordPhoto = (snapshot.val().photoUrl);
      var recordImage = (snapshot.val().imageUri);
      var recordTitle = (snapshot.val().title);
      var recordContent = (snapshot.val().content);
      var recordQuote = (snapshot.val().quote);
      var recordEnding = (snapshot.val().ending);
      var recordWriterA = (snapshot.val().coWriterA);
      var recordPhotoA = (snapshot.val().photoUrlA);
      var recordWriterB = (snapshot.val().coWriterB);
      var recordPhotoB = (snapshot.val().photoUrlB);
      var recordWriterC = (snapshot.val().coWriterC);
      var recordPhotoC = (snapshot.val().photoUrlC);
      var recordWriterD = (snapshot.val().coWriterD);
      var recordPhotoD = (snapshot.val().photoUrlD);

      var currentUser = this.auth.currentUser;
      var i = 0;
      var div = document.getElementsByClassName("users-container")[i];
      div.getElementsByClassName("user-pic")[i].style.backgroundImage = 'url(' + recordPhoto + ')';
      div.getElementsByClassName("user-name")[i].innerHTML = recordName;
      div.getElementsByClassName("mdl-chip")[i].removeAttribute('hidden');

      if (recordImage) {

      }
      if (recordWriterA) {
        i++;
        div.getElementsByClassName("user-pic")[i].style.backgroundImage = 'url(' + recordPhotoA + ')';
        div.getElementsByClassName("user-name")[i].innerHTML = value.recordWriterA;
        div.getElementsByClassName("mdl-chip")[i].removeAttribute('hidden');
      }
      if (recordWriterB) {
        i++;
        div.getElementsByClassName("user-pic")[i].style.backgroundImage = 'url(' + recordPhotoB + ')';
        div.getElementsByClassName("user-name")[i].innerHTML = value.recordWriterB;
        div.getElementsByClassName("mdl-chip")[i].removeAttribute('hidden');
      }
      if (recordWriterC) {
        i++;
        div.getElementsByClassName("user-pic")[i].style.backgroundImage = 'url(' + recordPhotoC + ')';
        div.getElementsByClassName("user-name")[i].innerHTML = value.recordWriterC;
        div.getElementsByClassName("mdl-chip")[i].removeAttribute('hidden');
      }
      div.getElementsByClassName("user-pic")[4].style.backgroundImage = 'url(' + currentUser.photoURL + ')';
      div.getElementsByClassName("user-name")[4].innerHTML = currentUser.displayName;
      div.getElementsByClassName("mdl-chip")[4].removeAttribute('hidden');
      if (recordTitle) {
        this.titleStory.value = recordTitle;
        this.divTitle.innerHTML = recordTitle.replace(/\n/g, '<br>');
        this.txtTitle.setAttribute('hidden', 'true');
      } else {
        this.divTitle.setAttribute('hidden', 'true');
      }
      if (recordContent) {
        this.contentStory.value = recordContent;
        this.divContent.innerHTML = recordContent.replace(/\n/g, '<br>');
        this.txtContent.setAttribute('hidden', 'true');
      } else {
        this.divContent.setAttribute('hidden', 'true');
      }
      if (recordQuote) {
        this.quoteStory.value = recordQuote;
        this.divQuote.innerHTML = recordQuote.replace(/\n/g, '<br>');
        this.txtQuote.setAttribute('hidden', 'true');
      } else {
        this.divQuote.setAttribute('hidden', 'true');
      }
      if (recordEnding) {
        this.endingStory.value = recordEnding;
        this.divEnding.innerHTML = recordEnding.replace(/\n/g, '<br>');
        this.txtEnding.setAttribute('hidden', 'true');
      } else {
        this.divEnding.setAttribute('hidden', 'true');
      }
    }.bind(this));
  }
};

LiveCards.prototype.likeClick = function(clickID) {
  var badgeID = 'bg.' + clickID.substr(3);
  console.log("like: " + badgeID);
  var likeCount = 0;
  likeCount++;
  var likeBadge = document.getElementById(badgeID);
  likeBadge.setAttribute('data-badge', '+1');
  likeBadge.className = likeBadge.className + " show";
  setTimeout(function(){ likeBadge.className = likeBadge.className.replace(" show", ""); }, 2300);
}

LiveCards.prototype.shareClick = function(clickID) {
  console.log("share: " + clickID.substr(3));
}

$(document).ready(function() {
  $(document).on('click', '.co-writer', function(){ window.livecards.coWritingClick(this.id); });
  $(document).on('click', '.like-button', function(){ window.livecards.likeClick(this.id); });
  $(document).on('click', '.share-button', function(){ window.livecards.shareClick(this.id); });
});

window.onload = function() {
  window.livecards = new LiveCards();
};
