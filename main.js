window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-146662310-1');

  (async function() {
  "use strict";

  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  let countdown = select('.countdown');
  const output = countdown.innerHTML;

  let largeCountdown = select('.largeCountdown');
  const largeOutput = countdown.innerHTML;

  const periodoutput = document.getElementsByClassName('period')[0].innerHTML;
  const timeuntiloutput = document.getElementsByClassName('timeuntil')[0].innerHTML;
  var goal = 24420;
  var period = ""
  var myArray = []

  var prevK = 0;
  var rawArray = {};

  var data = JSON.parse(await (await (await fetch('https://raw.githubusercontent.com/DefyGG/poolesvilleschedule/main/data.json')).blob()).text())

  const updateSchedule = function() {
    calculateGoal()

    var result = '';

    for(var i=0; i<myArray.length; i++) {
        if (i == myArray.length-1){
          result += "<tr class=''>";
        }
        else {
          result += "<tr class='border-b w-full'>";
        }
        for(var j=0; j<myArray[i].length; j++){
            if (j == 0){
              result += "<td class='pr-8 py-2 pl-4 border-r font-bold text-xl'>"+myArray[i][j]+"</td>";
            }
            else {
              result += "<td class='pl-6'>"+myArray[i][j]+"</td>";
            }
        }
        result += "</tr>";
    }

  }
  const proccessTime = function(time) {
    if (Math.floor(time/60/60) > 12){
      time -= 12*60*60;
    }
    return "" + Math.floor(time/60/60) + ":" + (Math.floor((time/60))%60 < 10 ? "0" : "") + Math.floor((time/60))%60;
  }

  const calculateGoal = function() {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1; 
    const year = date.getFullYear();
    var str = `${month}/${day}`;
    var cur = date.getHours();
    var val = cur*60*60 + date.getMinutes()*60 + date.getSeconds();
    if (!(str in data)){
      str = "base"
    }

    var prevK = 0

    var arr = data[str];
    var periods = arr[1];
    var largestUnder = -1;
    var largest = -1;
    myArray = []

    var schoolStart = 10000000;
    for (let k in periods){
      k= parseInt(k)
      if (k < schoolStart){
        schoolStart = k
      }
      myArray.push([periods[k][1], proccessTime(k) + " -> " + proccessTime(periods[parseInt(k)][0])])
      rawArray[periods[k][1]] = [k, periods[parseInt(k)][0]]
      if (k < val && k > largestUnder){
        largestUnder = k;
      }
      if (k > largest){
        largest = k;
      }
      prevK = k;
    }
    if (largestUnder == -1){
      goal = schoolStart
      period = "Before School"
      document.getElementsByClassName('timeuntil')[0].innerHTML = timeuntiloutput.replace('%inf',"period starts...")
    }
    else if (periods[largestUnder][0] - val < 0 && largestUnder != largest){
      document.getElementsByClassName('timeuntil')[0].innerHTML = timeuntiloutput.replace('%inf',"period starts...")
      for (let k in periods){
        k = parseInt(k)
        if (k > largestUnder){
          goal = k;
          prevK = k;
          break;
        }
      }
      period = "Transition"
    }
    else{
      period = periods[largestUnder][1]
      goal = periods[largestUnder][0];
      document.getElementsByClassName('timeuntil')[0].innerHTML = timeuntiloutput.replace('%inf',"period ends...")
    }



  }
  const countDownDate = function() {
    calculateGoal();
    const date = new Date();

    const day = date.getDate();
    const month = date.getMonth() + 1; 
    const year = date.getFullYear();
    var str = `${month}/${day}`;
    if (!(str in data)){
      str = "base"
    }

    var cur = date.getHours();

    var val = cur*60*60 + date.getMinutes()*60 + date.getSeconds();

    let timeleft = goal - val;
    if (timeleft <= 0){
      timeleft = 0
    }

    let hours = Math.floor(timeleft / (60 * 60));
    let minutes = Math.floor((timeleft - hours * 60 * 60) / 60);
    let seconds = Math.floor((timeleft - hours * 60 * 60 -minutes*60 ));

    countdown.innerHTML = output.replace('%h', hours.toString().padStart(2)).replace('%m', minutes.toString().padStart(2)).replace('%s', seconds.toString().padStart(2, '0'));
    largeCountdown.innerHTML = largeOutput.replace('%h', hours.toString().padStart(2)).replace('%m', minutes.toString().padStart(2)).replace('%s', seconds.toString().padStart(2, '0'));

    document.title = countdown.innerHTML + " - PHS Schedule"
    
    document.getElementsByClassName('period')[0].innerHTML = periodoutput.replace('%d',period)

    document.getElementById("percentageCircle").style.strokeDasharray = `${(rawArray[period][1]-val)/(rawArray[period][1] - rawArray[period][0])*659}, 659`;
    document.getElementById("largePercentageCircle").style.strokeDasharray = `${(rawArray[period][1]-val)/(rawArray[period][1] - rawArray[period][0])*1086}, 1086`;


    var dateObj = new Date();
    var monthe = dateObj.getMonth() + 1; //months from 1-12
    var daye = dateObj.getDate();
    var yeare = dateObj.getFullYear();

    var newdate = monthe + "/" + daye + "/" + yeare;

  }
  updateSchedule()
  countDownDate();

  setInterval(countDownDate, 1000);
  setInterval(updateSchedule, 1000);

})()
