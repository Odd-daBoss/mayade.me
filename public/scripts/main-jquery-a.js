$(document).ready(function() {
  $(document).on('click', '.co-writer', function() {
    console.log(this.id);
    var cowriteID = this.id.substr(3);
    console.log(cowriteID);
  });

  $(document).on('click', '.like-button', function() {
    console.log(this.id);
    var likeID = this.id.substr(3);
    console.log(likeID);
  });

  $(document).on('click', '.share-button', function() {
    console.log(this.id);
    var shareID = this.id.substr(3);
    console.log(shareID);
  });
});
