const { Builder, By, Key, until } = require("selenium-webdriver");
const getLatestTweetText = require("./getLatestTweetText");

let [nodePath, scriptPath, username, password, columnno] = process.argv;
if (!username) {
  console.log('username is required')
  return process.exit(1);
}
if (!password) {
  console.log('password is required')
  return process.exit(1)
};
if (!columnno) {
  console.log('column no to scrape is required')
  return process.exit(1)
};

let url =
  "https://mobile.twitter.com/login?hide_message=true&redirect_after_login=https%3A%2F%2Ftweetdeck.twitter.com%2F%3Fvia_twitter_login%3Dtrue";
let usernameTextbox =
  '//*[@id="react-root"]/div/div/div[2]/main/div/div/div[2]/form/div/div[1]/label/div/div[2]/div/input';
let passwordTextbox =
  '//*[@id="react-root"]/div/div/div[2]/main/div/div/div[2]/form/div/div[2]/label/div/div[2]/div/input';
let columnCssSelectPath = `section:nth-child(${columnno}) .chirp-container article:nth-child(1) .js-tweet-text`;
let appColumns;
let recentTweets = { value: "" };
let stocks = [];
let millisecondsForNewDay =
  new Date().getHours() * (60000 * 60) + new Date().getHours() * 60;
let email = 'anthonyfinix@gmail.com';
(async function example() {
  let driver = await new Builder().forBrowser("chrome").build();

  // go to page
  try {
    console.log("opening url");
    await driver.get(url);
  } catch (e) {
    console.log("*******************************");
    console.log(
      "could not visit: https://mobile.twitter.com/login?hide_message=true&redirect_after_login=https%3A%2F%2Ftweetdeck.twitter.com%2F%3Fvia_twitter_login%3Dtrue"
    );
    console.log("*******************************");
    console.log("ERROR");
    console.log(e.message);
    console.log("*******************************");
    await driver.quit();
    process.exit();
  }

  // wait for username textbox
  try {
    await driver.wait(until.elementLocated(By.xpath(usernameTextbox)), 2000);
    // type username
    console.log("typing username");
    await driver
      .findElement(By.xpath(usernameTextbox))
      .sendKeys(`@${username}`, Key.RETURN);
    // type password
    console.log("typing password");
    await driver
      .findElement(By.xpath(passwordTextbox))
      .sendKeys(password, Key.RETURN);
  } catch (e) {
    console.log("*******************************");
    console.log("could not find username and password textbox");
    console.log("*******************************");
    console.log("ERROR");
    console.log(e.message);
    console.log("*******************************");
    await driver.quit();
    process.exit();
  }

  // wait for twitter deck column wrapper
  try {
    console.log("waiting for twitter deck elements to appear...");
    await driver.wait(until.elementLocated(By.css("#container > div")), 10000);
  } catch (e) {
    console.log("*******************************");
    console.log("could not find twitter deck");
    console.log("*******************************");
    console.log("ERROR");
    console.log(e.message);
    console.log("*******************************");
    try{
      if(!!(await driver.findElement(By.xpath('//*[@id="react-root"]/div/div/div[2]/main/div/div/div[1]/div')).getText())){
        await driver.findElement(By.xpath(usernameTextbox)).sendKeys(email, Key.RETURN);
        await driver.findElement(By.xpath(passwordTextbox)).sendKeys(password, Key.RETURN);
     }
    }catch(e){
      await driver.quit();
      process.exit();
    }
     
  }

  // get app component
  try {
    console.log("searching for column wrapper");
    appColumns = await driver.findElement(By.css(".app-columns"));
  } catch (e) {
    console.log("*******************************");
    console.log("could not find column wrapper");
    console.log("*******************************");
    console.log("ERROR");
    console.log(e.message);
    console.log("*******************************");
    await driver.quit();
    process.exit();
  }

  setInterval(() => {
    stocks = [];
  }, millisecondsForNewDay);

  setInterval(async () => {
    let latestValue;
    try {
      latestValue = await appColumns.findElement(By.css(columnCssSelectPath)).getText();
      if (latestValue !== recentTweets.value) {
        recentTweets.value = latestValue;
        if (recentTweets.value.includes("ALERT:")) {
          let stock = recentTweets.value.match(/\$[A-Za-z0-9]+/);
          if (!!stock) {
            console.log(stock[0].replace("$", ""));
            stocks.push(stock[0]);
          }
        }
      }
      console.log("_");
    } catch (e) {
      console.log("*******************************");
      console.log("could not find column wrapper");
      console.log("*******************************");
      console.log("ERROR");
      console.log(e.message);
      console.log("*******************************");
      await driver.quit();
      process.exit();
    }
  }, 800);
})();
