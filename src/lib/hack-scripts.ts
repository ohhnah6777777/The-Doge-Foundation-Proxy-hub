// Raw bookmarklet sources shown (and copied) in the hacks library.

export const historyFlooder = String.raw`javascript:var num=prompt("History flood amount: "); done = false; x = window.location.href; for (var i=1; i<=num; i++) {history.pushState(0, 0, i==num?x:i.toString()); if(i==num){done=true}}if(done===true){alert("History flood successful! "+window.location.href+" now appears in your history "+num+(num==1?" time.":" times. (Made by JonasFlynn)"))}`;

export const bubbleLetters = String.raw`javascript: (function () {window.g = function () {function G(element) {if (element.childNodes.length > 0)for (var i = 0; i < element.childNodes.length; i++) {if (element.childNodes[i].nodeName.toLowerCase() !== 'style' && element.childNodes[i].nodeName.toLowerCase() !== 'script') {G(element.childNodes[i]);}}if (element.nodeType === Node.TEXT_NODE && element.nodeValue !== '') {var thechars =['ⓐ','ⓑ','ⓒ','ⓓ','ⓔ','ⓕ','ⓖ','ⓗ','ⓘ','ⓙ','ⓚ','ⓛ','ⓜ','ⓝ','ⓞ','ⓟ','ⓠ','ⓡ','ⓢ','ⓣ','ⓤ','ⓥ','ⓦ','ⓧ','ⓨ','ⓩ','Ⓐ','Ⓑ','Ⓒ','Ⓓ','Ⓔ','Ⓕ','Ⓖ','Ⓗ','Ⓘ','Ⓙ','Ⓚ','Ⓛ','Ⓜ','Ⓝ','Ⓞ','Ⓟ','Ⓠ','Ⓡ','Ⓢ','Ⓣ','Ⓤ','Ⓥ','Ⓦ','Ⓧ','Ⓨ','Ⓩ','①','②','③','④','⑤','⑥','⑦','⑧','⑨','⓪'];element.textContent = element.textContent.replace('a', thechars[0]).replace('b', thechars[1]).replace('c', thechars[2]).replace('d', thechars[3]).replace('e', thechars[4]).replace('f', thechars[5]).replace('g', thechars[6]).replace('h', thechars[7]).replace('i', thechars[8]).replace('j', thechars[9]).replace('k', thechars[10]).replace('l', thechars[11]).replace('m', thechars[12]).replace('n', thechars[13]).replace('o', thechars[14]).replace('p', thechars[15]).replace('q', thechars[16]).replace('r', thechars[17]).replace('s', thechars[18]).replace('t', thechars[19]).replace('u', thechars[20]).replace('v', thechars[21]).replace('w', thechars[22]).replace('x', thechars[23]).replace('y', thechars[24]).replace('z', thechars[25]).replace('A', thechars[26]).replace('B', thechars[27]).replace('C', thechars[28]).replace('D', thechars[29]).replace('E', thechars[30]).replace('F', thechars[31]).replace('G', thechars[32]).replace('H', thechars[33]).replace('I', thechars[34]).replace('J', thechars[35]).replace('K', thechars[36]).replace('L', thechars[37]).replace('M', thechars[38]).replace('N', thechars[39]).replace('O', thechars[40]).replace('P', thechars[41]).replace('Q', thechars[42]).replace('R', thechars[43]).replace('S', thechars[44]).replace('T', thechars[45]).replace('U', thechars[46]).replace('V', thechars[47]).replace('W', thechars[48]).replace('X', thechars[49]).replace('Y', thechars[50]).replace('Z', thechars[51]).replace('fax', '℻').replace('1', thechars[52]).replace('2', thechars[53]).replace('3', thechars[54]).replace('4', thechars[55]).replace('5', thechars[56]).replace('6', thechars[57]).replace('7', thechars[58]).replace('8', thechars[59]).replace('9', thechars[60]).replace('0', thechars[61]);}}var html = document.getElementsByTagName('html')[0];G(html);};setInterval(g, 1);})();`;

export const drawOnScreen = String.raw`javascript:var opt=1;alert("keyboard commands:c=color picker. u=pen up. d=pen down. s=size. o=opacity. reload to clear.");var pen='none';var size=10;function repeat(event){(function(){var color=document.createElement('div');var body=document.getElementsByTagName('body')[0];body.appendChild(color);color.style.position='fixed';color.style.bottom='0px';color.style.right='0px';color.style.margin='0px';color.style.paddingTop='0px';color.style.width='1366px';color.style.height='20px';color.style.zIndex=10000;color.style.opacity=0.8;color.style.color='white';color.style.backgroundColor='black';color.style.border='0px solid black';color.style.textAlign='center';color.style.cursor='pointer';color.id='color';color.style.display='circle';color.innerText='by dragonmaster73101';document.getElementById('me').addEventListener('click',function(){window.open('https://github.com/dragon731012');});}());}function mousemove(event){var x=event.clientX;var y=event.clientY;x=x-9-size;y=y-12-size;(function(){var elem=document.createElement('div');var body=document.getElementsByTagName('body')[0];body.appendChild(elem);elem.style.position='fixed';elem.style.top=''+y+'px';elem.style.left=''+x+'px';elem.style.margin='10px';elem.style.paddingTop='10px';elem.style.width=''+size+'px';elem.style.height=''+size+'px';elem.style.zIndex=10000;elem.style.opacity=opt;elem.style.color=''+clr+'';elem.style.backgroundColor=''+clr+'';elem.style.border='0px solid white';elem.style.textAlign='center';elem.id='paint';elem.style.display=''+pen+'';elem.innerText='';}());}window.addEventListener("keydown",function(event){if (event.key=="c"){clr=prompt("what color do you want? must be very broad, and with no caps or special characters. ex:blue");elem.style.display=%27block%27;}});window.addEventListener("keydown",function(event){if (event.key=="s"){size=prompt("what size do you want? no caps, letters, or special characters. ex: 10");elem.style.display=%27block%27;}});window.addEventListener("keydown",function(event){if(event.key=="u"){pen=%27none%27;}});window.addEventListener("keydown",function(event){if(event.key=="d"){pen=%27circle%27;}});window.addEventListener("keydown",function(event){if(event.key=="o"){opt=prompt("what do you want the opacity to be? 1 to 0. 1=none. 0=a lot.");}});window.addEventListener(%27mousemove%27,mousemove);repeat();`;

export const rainbowPage = String.raw`javascript:(()=>{let s=document.getElementById('bm-rainbow');if(s){s.remove();return;}s=document.createElement('style');s.id='bm-rainbow';s.textContent='html{animation:bmRainbow 2s linear infinite!important;}@keyframes bmRainbow{from{filter:hue-rotate(0deg)}to{filter:hue-rotate(360deg)}}';document.head.appendChild(s)})()`;

export const calculator = String.raw`javascript: var versionCalc = prompt('1). Basic Calculator\n2). Equations');
switch (versionCalc) {
  case '1':
    var operatorType = parseInt(prompt('1). Addition\n2). Subtraction\n3). Multiplication\n4). Division'));
    switch (operatorType) {
      case 1:
        var num1 = parseInt(prompt('First Number:'));
        var num2 = parseInt(prompt('Second Number:'));
        result = num1 + num2;
        break;
      case 2:
        var num1 = parseInt(prompt('First Number:'));
        var num2 = parseInt(prompt('Second Number:'));
        result = num1 - num2;
        break;
      case 3:
        var num1 = parseInt(prompt('First Number:'));
        var num2 = parseInt(prompt('Second Number:'));
        result = num1 * num2;
        break;
      case 4:
        var num1 = parseInt(prompt('First Number:'));
        var num2 = parseInt(prompt('Second Number:'));
        result = num1 / num2;
        break;
      default:
        alert('That is not a valid input. Input the number of the operation you are trying to run');
        break;
    };
  break;
  case '2':
    var equationType = parseInt(prompt('1). Slope\n2). Area of a circle\n3). Area of a square/rectangle\n4). Area of a triangle\n5). Volume of a cube\n6). Distance\n7). Time\n8). Speed'));
    switch (equationType) {
      case 1:
        m = parseInt(prompt("What is the rise/run? (M)"));
        x = parseInt(prompt("What is the distance of the line from the x-axis? (X)"));
        b = parseInt(prompt("What is the Y-Intercept? (B)"));
        result = (m * x) + b;
        break;
      case 2:
        r = parseInt(prompt('What is the radius of the circle? (R)'));
        r2 = r * r;
        result = r2 * 3.14;
        break;
      case 3:
        l = parseInt(prompt('What is the length?'));
        w = parseInt(prompt('What is the width?'));
        result = l * w;
        break;
      case 4:
        b = parseInt(prompt("What is the base of the triangle?"));
        h = parseInt(prompt("what is the height of the triangle?"));
        result = (b * h) / 2;
        break;
      case 5:
        l = parseInt(prompt('What is the length?'));
        w = parseInt(prompt('What is the width?'));
        h = parseInt(prompt('What is the height?'));
        result = l * w * h;
        break;
      case 6:
        s = parseInt(prompt('What is the speed?'));
        t = parseInt(prompt('What is the time?'));
        result = s * t;
        break;
      case 7:
        s = parseInt(prompt('What is the speed?'));
        d = parseInt(prompt('What is the distance?'));
        result = d / s;
        break;
      case 8:
        s = parseInt(prompt('What is the time?'));
        d = parseInt(prompt('What is the distance?'));
        result = d / t;
        break;
      default:
        alert('That is not a valid input. Input the number of the operation you are trying to run');
        break;
    };
  break;
  default:
    alert('That is not a valid input. Input the number of the operation you are trying to run');
};
alert('Your answer is ' + result);`;
