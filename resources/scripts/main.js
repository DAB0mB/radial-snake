document.addEventListener("DOMContentLoaded", function(event) {
  let game = new Engine.Game(document.getElementById("gameCanvas"), false);
  game.changeScreen(Game.Screens.Splash);
  game.play();
});