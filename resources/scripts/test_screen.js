class TestScreen extends Engine.Screen {
  draw(context) {
    // A 20px sized "Georgia" font (Available natively)
    context.font = "20px Georgia";
    // The text should be colored white
    context.fillStyle = "white";
    // Draw the following message 50px from the left and 50px from the top
    context.fillText("This is a Test Screen", 50, 50);
  }
};