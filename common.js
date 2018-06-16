/*
 @author       rRuleZ | rRuleZ@everyz.org
 @description  This script is used on FastOPR
 @objective    Improve and extend OPR UI
 
 MIT License
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IpN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 
 */

var version = '20171212-1';
gmMS = (typeof gmMS == 'undefined' ? {} : gmMS);
//var gmMS = {};
var translation = [];
var el, w, ansController, descriptionDiv, userObject, topBar;
var FastOPRData = [];
var OPRWaitList = [];
var fastVoteButtons = [];
var textButtons = [];
var textBox = null;
var cont = 0;
var debug = false;
var reloadOnFail = false;
var vTry = 0;
var autoRedir = true;
var userLang = navigator.language || navigator.userLanguage;
gmMS.angularCheck = 0;
var vSuperDebug = false;

function getZoom() { // Original code from: https://stackoverflow.com/questions/2812096/how-do-i-programmatically-determine-the-current-zoom-level-of-a-browser-window

    var ovflwTmp = $('html').css('overflow');
    $('html').css('overflow', 'scroll');
    var viewportwidth;
    // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight 
    if (typeof window.innerWidth != 'undefined') {
        viewportwidth = window.innerWidth;
    } else if (typeof (document.documentElement) != 'undefined' &&
            typeof document.documentElement.clientWidth != 'undefined' &&
            document.documentElement.clientWidth != 0) {
        // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document) 
        viewportwidth = document.documentElement.clientWidth;
    } else {
        // older versions of IE 
        viewportwidth = document.getElementsByTagName('body')[0].clientWidth;
    }

    var windW = $(window).width();
    var scrollBarW = viewportwidth - windW;
    if (!scrollBarW)
        return 1;
    $('html').css('overflow', ovflwTmp);
    var tmp = (15 / scrollBarW);
    return  Math.round((tmp > 1 ? 1 : tmp) * 100) / 100;
}

gmMS.getString = function (tag) {
    return translation[tag];
};

gmMS.voteIcon = function (approved) {
    return "<img scr='" + window.baseURL + "/images/" + (approved ? "approved" : "rejected") + ".png'></img>";
};

gmMS.newStorageJSON = function (name) {
    FastOPRData[name] = localStorage.getItem(name);
    FastOPRData[name] = (FastOPRData[name] === null ? [] : JSON.parse(FastOPRData[name]));
};

gmMS.today = function () {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    return yyyy + mm + dd;
};
gmMS.toConsole = function (obj, show) {
     show = (typeof show == 'undefined' ? false : show);
    if (show == true) {
        if (obj !== null && typeof obj === 'object') {
            var out = '';
            for (var i in obj) {
                out += i + ": " + obj[i] + "\n";
            }
        } else {
            out = obj;
        }
        window.console.log("FastOPR - " + out);
    }
};
gmMS.div = function (content, id, className) {
    return "<div " + (typeof id !== "undefined" ? "id='" + id + "'" : '') + " class='" + (typeof className !== "undefined" ? className : "") + "'>" + content + "</div>";
};
gmMS.divTable = function (content, id, className) {
    return gmMS.div(content, id, "rTable" + (typeof className !== "undefined" ? " " + className : ""));
};
gmMS.divRow = function (content, id, className) {
    return gmMS.div(content, id, "rTableRow" + (typeof className !== "undefined" ? " " + className : ""));
};
gmMS.divCell = function (content, id, className) {
    return gmMS.div(content, id, "rTableCell" + (typeof className !== "undefined" ? " " + className : ""));
};
gmMS.spanDebug = function (msg) {
    return '<span style="margin-left: 5px" class="ingress-mid-blue pull-left">' + msg + '</span>';
};
gmMS.waitForElement = function (search, func, timeout, nameWait) {
    if (w.document.querySelector(search) === null) {
        if (!OPRWaitList[nameWait]) {
            gmMS.toConsole('Add wait element: ' + nameWait);
            OPRWaitList[nameWait] = [search, func, parseInt(timeout), Date.now()];
        } else {
            gmMS.toConsole("Already exists check: " + OPRWaitList[nameWait]);
        }
    } else {
        gmMS.toConsole('Element found: ' + nameWait + ". Calling function.");
        func();
    }
};
gmMS.checkWaitList = function () {
    gmMS.toConsole("Elements to check: " + Object.keys(OPRWaitList).length);

    for (var key in OPRWaitList) {
        element = w.document.querySelector(OPRWaitList[key][0]);
        elapsedTime = Date.now() - parseInt(OPRWaitList[key][3]);
        //gmMS.toConsole(OPRWaitList[key][0] + " - elapsed time: " + elapsedTime);
        if (elapsedTime > OPRWaitList[key][2]) {
            gmMS.toConsole("Element NOT found, but timeout is reached [" + OPRWaitList[key][0] + "].", true);
            delete OPRWaitList[key];
        } else if (element !== null && typeof element === 'object') {
            gmMS.toConsole("Element found, remove from list and call function [" + OPRWaitList[key][0] + "] [" + element.innerHTML + "].");
            OPRWaitList[key][1](element);
            delete OPRWaitList[key];
        }
    }
    cont++;
    if (cont > 50 || Object.keys(OPRWaitList).length === 0) {
        clearInterval(waitCheck);
        gmMS.toConsole('Clean check elements timer');
    }
};

gmMS.debugVar = function (name, value) {
    var vAngDebug = true;
    value = (typeof value == "undefined" ? "undefined" : value);
    gmMS.toConsole(name + " - " + value, vAngDebug);
};
gmMS.checkAngularJS = function (retry) {
// Init Angular
    try {
        gmMS.toConsole('Tentando localizar objetos do angularJS', true);
        retry = typeof retry == "undefined" ? false : retry;
        w = typeof unsafeWindow == "undefined" ? window : unsafeWindow;
        el = w.document.querySelector("[ng-app='portalApp']");
        w.$app = w.angular.element(el);
        w.$injector = w.$app.injector();
        w.$rootScope = w.$app.scope();
        w.$scope = function (element) {
            return w.angular.element(element).scope();
        };
        // Get principal objects
        descriptionDiv = (typeof descriptionDiv == "undefined" ? document.getElementById("descriptionDiv") : descriptionDiv);
        ansController = w.$scope(descriptionDiv).answerCtrl;
        subController = w.$scope(descriptionDiv).subCtrl;
        w.$scope(descriptionDiv).subCtrl
        scope = w.$scope(descriptionDiv);
        pageData = subController.pageData;
        watchAdded = false;
        if (!watchAdded) {
            scope.$watch("subCtrl.pageData", function () {
            });
        }
    } catch (err) {
        gmMS.toConsole("erro em checkAngularJS [" + err + "]", true);
        gmMS.debugVar("w", w);
        gmMS.debugVar("el", el);
        gmMS.debugVar("descriptionDiv", descriptionDiv);
        gmMS.debugVar("ansController", ansController);
        gmMS.debugVar("subController", subController);
        gmMS.debugVar("subController.pageData", subController.pageData);
    }
    // Get All usefull objects
    if (retry == false) {
        gmMS.waitForElement("[ng-app='portalApp']", gmMS.getCandidateInfo, 10000, "w-portal-info");
        gmMS.waitForElement("[id='AnswersController']", gmMS.changeDisplay, 10000, "main-change-display");
    }
    // Debug Information
    waitCheck = setInterval(gmMS.checkWaitList, 500);
    gmMS.angularCheck += 1;
    if (gmMS.angularCheck >= 20) {
        window.location.assign("/recon");
    }
    if (typeof angular == 'undefined') {
        gmMS.toConsole('Erro: angular não foi carregado com sucesso!', true);
    } else {
        gmMS.toConsole('Angular carregado com sucesso!', true);
        divMessage.innerHTML = gmMS.getString("loadOk");
        divMessage.style = "background-color: black; color: green;";
        gmMS.showControls(true);
    }
};

gmMS.findElement = function (text) {
    for (var r = document.evaluate('//*[text()="' + text + '"]', document, null, 4, null), n; n = r.iterateNext(); ) {
        return n;
    }
};
gmMS.getChildIndex = function (child) {
    var parent = child.parentNode;
    var children = parent.children;
    var i = children.length - 1;
    for (; i >= 0; i--) {
        if (child == children[i]) {
            break;
        }
    }
    return i;
};
gmMS.getTextBox = function () {
    textBox = w.document.querySelector("#AnswersController > form > .text-center > textarea");
    if (typeof (textBox) === 'undefined') {
        setTimeout(function () {
            gmMS.toConsole('Não foi encontrado o textbox de comentários... ', true);
            gmMS.getTextBox();
        }, 1000);
    } else {
        textBox.id = "commentTextArea";
    }
};


// Specific  ===================================================================

gmMS.getCandidateInfo = function (obj) {
    gmMS.toConsole("gmMS.getCandidateInfo begin", vSuperDebug);
    element = w.document.querySelector("[ng-app='portalApp']");
    if (typeof (pageData) !== "undefined") {
        gmMS.toConsole('Candidate Portal Info found');
        // Show full size image
        FastOPRData.pageData = JSON.parse(JSON.stringify(pageData));
        FastOPRData.pageData.fullImageUrl = pageData.imageUrl + "=s0";
        FastOPRData.pageData.date = gmMS.today();
        // Alter map
        gmMS.portalRange();
        //gmMS.getTextBox();
        ansController.goToLocation = null;
        hasPortal = true;
        gmMS.fastOPRUpdateData();
    } else {
        if (vTry < 5) {
            setTimeout(function () {
                gmMS.toConsole("Não foram encontrados dados do portal, tentando novamente em três segundos..." + vTry, true);
                gmMS.showControls(false);
                divMessage.innerHTML = gmMS.getString("loadWait") + " (" + vTry + ")";
                divMessage.style = "-webkit-animation: blinker 1s 5; -moz-animation: blinker 1s 5; animation: blinker 1s 5; background-color: lightyellow; color: black;";
                if (vTry > 0) {
                    divMessage.innerHTML = gmMS.getString("loadFail");
                    divMessage.style = "background-color: red; color: black;";
                    if (reloadOnFail) {
                        window.location.assign("/recon");
                    } else {
                        gmMS.showControls(true);
                    }
                } else {
                    gmMS.getCandidateInfo();
                    hasPortal = false;
                    vTry++;
                }
            }, 2000);
        }
    }
    gmMS.toConsole("gmMS.getCandidateInfo end", vSuperDebug);
};

gmMS.showControls = function (show) {
    value = (show == true ? "inline" : "none");
    //submitDiv.style = "display: " + value + ";";
    //row2Right.style = "display: " + value + ";";
};

gmMS.getUserInfo = function (obj) {
    gmMS.toConsole("gmMS.getUserInfo begin", vSuperDebug);
    element = w.document.querySelector("[id='player_stats']");
    var player = w.document.getElementById("player_stats").children[1].innerHTML;
    gmMS.toConsole('user info found [' + player + ']');
    var stats = w.document.getElementById("player_stats").children[2];
    var statsReport = w.document.querySelector("#player_stats:not(.visible-xs) div p:last-child");
    if (typeof (reviewed) === "undefined") {
        reviewed = parseInt(stats.children[3].children[2].innerHTML);
        accepted = parseInt(stats.children[5].children[2].innerHTML);
        rejected = parseInt(stats.children[7].children[2].innerHTML);
        percent = Math.round(((accepted + rejected) / reviewed) * 1000) / 10;
        userObject = {'player': player, 'reviewed': reviewed, 'accepted': accepted, 'rejected': rejected, 'status': (topBar.innerHTML.indexOf("/img/great.png") > 0 ? "great" :
                    (topBar.innerHTML.indexOf("/img/poor.png") > 0 ? "poor" : "good"))};
        gmMS.toConsole(userObject, true);
        //topBar = (typeof topBar == "undefined" ? document.getElementsByClassName("navbar-collapse navbar-responsive-collapse collapse")[0] : topBar);
        if (typeof (topBar) === "undefined") {
            gmMS.toConsole("w - " + typeof (reviewed), true);
            gmMS.toConsole("ansController - " + typeof (ansController), true);
        }
        var vTotal = accepted + rejected;
        var vStatus = (vTotal > 9999 ? "Onyx" : (vTotal > 4999 ? "Platinum" : (vTotal > 2499 ? "Gold" : (vTotal > 749 ? "Silver" : (vTotal > 99 ? "Bronze" : "")))));

        topBar.children[1].classList.remove('container');
        topBar.insertAdjacentHTML("beforeEnd", "<div class='right' style='text-align: right'>"
                + "<img src='" + window.baseURL + "/images/"
                + userObject.status
                + "-20.png'/>"
                + "<span class='ingress-mid-blue pull-right'>Percent processed: " + percent + "%"
                + " (" + reviewed + "/" + accepted + "/" + rejected + ") [" + vStatus + "]" + "</span>"
                + "<br><div id='FastOPRToday' class='todayVotes' title='Total votes of today (Approved / Dupplicated / Rejected)'><span title='Timeout to back to home to avoid softban' id='FastOPRBTimer' class='rTimeOut'></span></div>"
                + "</div>"
                );

        if (typeof (pageData) !== "undefined") {
            FastOPRData.userData = userObject;
        }
        statsReport.insertAdjacentHTML("afterEnd", '<br><p><span class="glyphicon glyphicon-info-sign ingress-gray pull-left"></span><span style="margin-left: 5px" class="ingress-mid-blue pull-left">Percent Processed</span> <span class="gold pull-right">' + percent + '%</span></p>');
    }
    debugInfo = gmMS.spanDebug('-= Debug Information =-');
    statsReport.insertAdjacentHTML("afterEnd", gmMS.divTable(gmMS.divRow(debugInfo, '', 'rDebugDiv'), 'FastOPRDebug', 'floatingFastOPR'));
    divDebug = document.getElementById("FastOPRDebug").children[0];
    gmMS.addUserDebug("<br> Screen (" + screen.height + "/" + screen.width + ")");

    if (window.location.href === "https://opr.ingress.com/recon") {
        gmMS.autoBackHome();
    }
    gmMS.toConsole("gmMS.getUserInfo end", vSuperDebug);
};

gmMS.addUserDebug = function (text) {
    divDebug.insertAdjacentHTML("beforeEnd", text);
};

gmMS.autoBackHome = function () {
// Set the date we're counting down to
    var countDownDate = Date.now() + 1150000;
    var x = setInterval(function () {
        var distance = countDownDate - Date.now();
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        var todayDiv = document.getElementById("FastOPRBTimer");
        todayDiv.innerHTML = "" + minutes + "m " + seconds + "s ";
        if (distance < 0) {
            clearInterval(x);
            todayDiv.innerHTML = "EXPIRED";
            window.location.assign("/");
        }
    }, 5000);
};

gmMS.fastOPRUpdateData = function () {
    gmMS.toConsole("gmMS.fastOPRUpdateData begin", vSuperDebug);
// Get User information
    if (userObject) {
        FastOPRData.userData = userObject;
        gmMS.toConsole("==== User Data =====");
        gmMS.toConsole(FastOPRData.userData);
    }
    if (FastOPRData.nearbyPortals) {
        gmMS.toConsole("==== Nearby Portals =====");
        for (var key in FastOPRData.nearbyPortals) {
// skip loop if the property is from prototype
            if (!FastOPRData.nearbyPortals.hasOwnProperty(key))
                continue;
            var obj = FastOPRData.nearbyPortals[key];
            for (var prop in obj) {
// skip loop if the property is from prototype
                if (!obj.hasOwnProperty(prop))
                    continue;
                // your code
                gmMS.toConsole(" -- " + prop + " = " + obj[prop]);
            }
        }
    }
//NewSubmissionDataService
//        .getNewLocationMarker().getPosition()
//gmMS.toConsole(subController.NewSubmissionDataService.getNewLocationMarker(),true);
    if (typeof (redir) !== 'undefined') {
// Atualisa estatística de votos
        if ((ansController.formData.quality === "") || (ansController.formData.quality === "1")) {
            FastOPRData['statistics'].voteInvalid += 1;
            if ((ansController.formData.quality === "")) {
                FastOPRData['statistics'].voteDuplicate += 1;
            }
        } else {
            FastOPRData['statistics'].voteValid += 1;
        }
        gmMS.historyManager();
    }
    gmMS.toConsole("gmMS.fastOPRUpdateData end", vSuperDebug);
//    gmMS.toConsole(FastOPRData);
};

gmMS.historyManager = function () {
    gmMS.toConsole("gmMS.historyManager begin", vSuperDebug);
// Salvando estatísticas ===================================================
    if (typeof (FastOPRData.pageData) !== 'undefined') {
        FastOPRData['statistics'].processed = percent;
        if (Object.keys(FastOPRData['history']).length === 0) {
            FastOPRData['history'].push(FastOPRData['statistics']);
        }
        for (i in FastOPRData['history']) {
            if (FastOPRData['history'][i].date === FastOPRData['statistics'].date) {
                FastOPRData['history'][i] = FastOPRData['statistics'];
                var historyFound = true;
            }
        }
        if (typeof (historyFound) === 'undefined') {
            FastOPRData['statistics'] = {'date': gmMS.today(), 'voteInvalid': 0, 'voteDuplicate': 0, 'voteValid': 0};
            FastOPRData['history'].push(FastOPRData['statistics']);
        }
//FastOPRData['statistics'].date = '20170704';
// Salvando informações do portal ==========================================
        FastOPRData.pageData.date = FastOPRData['statistics'].date;
        FastOPRData.pageData.quality = ansController.formData.quality;
        FastOPRData.pageData.uniqueness = ansController.formData.uniqueness;
        FastOPRData.pageData.cultural = ansController.formData.cultural;
        FastOPRData.pageData.description = ansController.formData.description;
        FastOPRData.pageData.location = ansController.formData.location;
        FastOPRData.pageData.safety = ansController.formData.safety;
        for (i in FastOPRData['candidates']) {
            if (FastOPRData['candidates'][i].fullImageUrl === FastOPRData.pageData.fullImageUrl) {
                FastOPRData['candidates'][i] = FastOPRData.pageData;
                var candidateFound = true;
            }
        }
        if (typeof (candidateFound) === 'undefined' || Object.keys(FastOPRData['candidates']).length === 0) {
            FastOPRData['candidates'].push(FastOPRData.pageData);
            //alert('novo');
        } else {
//alert('existe');
        }
        try {
            localStorage.setItem("statistics", JSON.stringify(FastOPRData['statistics']));
            localStorage.setItem("history", JSON.stringify(FastOPRData['history']));
            localStorage.setItem("candidates", JSON.stringify(FastOPRData['candidates']));
        } catch (err) {
	    localStorage.clear();
        }

        gmMS.toConsole(JSON.stringify(FastOPRData['statistics']), true);
        gmMS.toConsole('Total de candidatos em cache:' + Object.keys(FastOPRData['candidates']).length, true);
    }
    gmMS.toConsole("gmMS.historyManager end", vSuperDebug);
};

gmMS.fastOPRStorage = function () {
    gmMS.toConsole("gmMS.fastOPRStorage begin", vSuperDebug);
// Check browser support
    if (typeof (Storage) !== "undefined") {
// Store
        localStorageMsg = '-= LocalStorage OK =-';
        // Vote statistics
        FastOPRData['statistics'] = localStorage.getItem("statistics");
        gmMS.newStorageJSON('history');
        gmMS.newStorageJSON('candidates');
        if (typeof (FastOPRData['statistics']) === "undefined" || FastOPRData['statistics'] === null) {
            FastOPRData['statistics'] = {'date': gmMS.today(), 'voteInvalid': 0, 'voteDuplicate': 0, 'voteValid': 0};
        } else {
            FastOPRData['statistics'] = JSON.parse(FastOPRData['statistics']);
            if (FastOPRData['statistics'].date !== gmMS.today()) {
                FastOPRData['statistics'] = {'date': gmMS.today(), 'voteDuplicate': 0, 'voteInvalid': 0, 'voteValid': 0, 'processed': 0};
                gmMS.toConsole('Its a new day!!! Lets Work!!!', true);
            }
        }
        var tmp = document.getElementById("FastOPRToday");
        tmp.insertAdjacentHTML("beforeEnd", " [" + FastOPRData['statistics'].voteValid + " / " + FastOPRData['statistics'].voteDuplicate + " / " + (FastOPRData['statistics'].voteInvalid - FastOPRData['statistics'].voteDuplicate) + "]");
        gmMS.historyManager();
    } else {
        localStorageMsg = '-= Sorry, your browser does not support Web Storage... =-';
    }
    gmMS.toConsole(localStorageMsg);
    divDebug.insertAdjacentHTML("beforeEnd", gmMS.divRow(gmMS.divRow(gmMS.spanDebug(localStorageMsg))));
    gmMS.toConsole("gmMS.fastOPRStorage end", vSuperDebug);
};

gmMS.groupElements = function (parent, start, end) {
    var retorno = [];
    for (i = start; i <= end; i++) {
        retorno.push(parent.children[i]);
    }
    return retorno;
};

gmMS.moveRequirement = function (element, newParent, before, next) {
    var curIndex = gmMS.getChildIndex(element);
    var start = curIndex - before;
    var end = curIndex + next;
    var currParent = element.parentNode;
    for (i = start; i < end; i++) {
        var tmp = currParent.children[start];
        newParent.appendChild(tmp);
    }
};

gmMS.setGroupParent = function (group, newParent) {
    for (i = 0; i < group.length; i++) {
        newParent.appendChild(group[i]);
    }
};

gmMS.changeDisplay = function () {
// Select elements =========================================================
    skipLink = w.document.querySelector("#AnswersController > form > div:nth-child(8)");
    if (getZoom() < 1) {
        var cols = 20;
        var rows = 6;
    } else {
        var cols = 15;
        var rows = 10;
    }
    descriptionDiv = (typeof descriptionDiv == "undefined" ? w.document.querySelector("#AnswersController > form > div:nth-child(1) > div:nth-child(2)") : descriptionDiv);
    tmp = w.document.querySelector("#AnswersController > form > div:nth-child(1) > div");
    candidateImg = tmp.children[0];
    voteQuality = gmMS.groupElements(tmp, 1, 5);
    tmp = w.document.querySelector("#AnswersController > form > div:nth-child(2)");
    duplicateMap = gmMS.groupElements(tmp.children[0], 0, 1);
    duplicateFilmStrip = tmp.children[0].children[2];

    streetView = gmMS.groupElements(tmp.children[2], 0, 2);
    voteAcurate = gmMS.groupElements(tmp.children[2], 3, 8);
    voteSafetly = gmMS.groupElements(tmp.children[2], 9, 10);
    whatIsThis = w.document.querySelector("#AnswersController > form > div:nth-child(5)").children[0];
    tmp = w.document.querySelector("#AnswersController > form > div:nth-child(1) > div:nth-child(3)");
    voteTitle = gmMS.groupElements(tmp.children[0], 0, 4);
    voteCultural = gmMS.groupElements(tmp.children[0], 5, 9);
    voteUnique = gmMS.groupElements(tmp.children[0], 10, 14);
    submitDiv = w.document.querySelector("#AnswersController > form > div:nth-child(6)");
    groupComment = w.document.querySelector("#AnswersController > form > div:nth-child(7)");
    // Automatically open the first listed possible duplicate - from opr-tools
    try {
        e = w.document.querySelector("#map-filmstrip > ul > li:nth-child(1) > img");
        if (e !== null) {
            setTimeout(function () {
                e.click();
            }, 500);
        }
        // expand automatically the "What is it?" filter text box  - from opr-tools
        f = w.document.querySelector("#AnswersController > form > div:nth-child(5) > div > p > span.ingress-mid-blue.text-center");
        setTimeout(function () {
            f.click();
        }, 500);
        inputWhatIs = w.document.querySelector("#AnswersController > form > div:nth-child(5) > div > div > input");
    } catch (err) {
    }

// Mover os botões para o lado direito =====================================
    gmMS.setGroupParent(voteQuality, divRightContainer);
    gmMS.setGroupParent(voteUnique, divRightContainer);
    divRightContainer.insertAdjacentHTML("beforeEnd", "<br>");
    gmMS.setGroupParent(voteTitle, divRightContainer);
    gmMS.setGroupParent(voteCultural, divRightContainer);
    gmMS.setGroupParent(voteSafetly, divRightContainer);
    gmMS.setGroupParent(voteAcurate, divRightContainer);
    // Mover a descrição do portal para o lado esquerdo ========================
    // Reorganiza o centro =====================================================
    answerForm = document.getElementById('AnswersController').children[0];

    mainCenter.appendChild(answerForm);
    tabEsq = gmMS.divTable(gmMS.divRow(gmMS.divCell("", "row1Left", "col-xs-12 col-sm-8") + gmMS.divCell("", "row1Center", "col-xs-12 col-sm-4"))
            + gmMS.divRow(gmMS.divCell("", "lineFilmStrip", ""))
            + gmMS.divRow(gmMS.divCell("", "row2Left", "")));
    tabDir = gmMS.divTable(gmMS.divRow(gmMS.divCell("", "row1Right"))
            + gmMS.divRow(gmMS.divCell("", "row2Right")));
    //gmMS.divTable(gmMS.divRow(gmMS.divCell("", "refLeft") + gmMS.divCell("", "refRight")))
    gmMS.divTable(gmMS.divRow(gmMS.divCell("", "", "col-xs-12 col-sm-6") + gmMS.divCell("", "", "col-xs-12 col-sm-6")));

    answerForm.insertAdjacentHTML("afterBegin", gmMS.divTable(""));
    answerForm.insertAdjacentHTML("afterBegin", gmMS.divTable(gmMS.divRow(
            gmMS.divCell(tabEsq, "", "col-xs-12 col-sm-6")
            + gmMS.divCell(tabDir, "", "col-xs-12 col-sm-6")
            )));
    answerForm.insertAdjacentHTML("afterBegin", gmMS.divTable(""));

    row1Left = document.getElementById("row1Left");
    row1Center = document.getElementById("row1Center");
    row1Right = document.getElementById("row1Right");
    row2Left = document.getElementById("row2Left");
    row2Right = document.getElementById("row2Right");

    descriptionDiv.classList.remove('col-xs-12');
    descriptionDiv.classList.remove('col-sm-4');
    row1Center.appendChild(descriptionDiv);

    row1Left.appendChild(candidateImg);
    gmMS.setGroupParent(streetView, row1Right);
    lineFilmStrip = document.getElementById("lineFilmStrip");
    lineFilmStrip.className += " rRowFilmStrip";
    portalList = document.getElementById("map-filmstrip");
    lineFilmStrip.appendChild(portalList);
    gmMS.setGroupParent(duplicateMap, row2Left);
    divLeftContainer.appendChild(groupComment);

    lineFilmStrip = document.getElementById("lineFilmStrip");
    textBox.rows = rows;
    textBox.cols = cols;
    row2Right.appendChild(submitDiv);//
    whatIsThis.classList.remove('col-xs-12');
    whatIsThis.classList.remove('col-sm-6');
    divRightContainer.appendChild(whatIsThis);
    if (typeof subController == "undefined" || typeof subController.pageData == "undefined") {
        gmMS.toConsole("Tentando novamente encontrar o angular...", true);
        gmMS.checkAngularJS(true);
    }
    try {
        candidateImg.insertAdjacentHTML("beforeBegin",
                "<div style='position:absolute;float:left;'><a class='button btn btn-default' style='display:inline-block;' href='" + subController.pageData.imageUrl + "=s0' target='_blank'><span class='glyphicon glyphicon-search' aria-hidden='true'></span></div>");
    } catch (err) {
    }

    // Mapas adicionais

    gmMS.additionalMaps();
    divLeftContainer.appendChild(skipLink);
    divLeftContainer.insertAdjacentHTML("beforeEnd", "<br>" + gmMS.div('', "fastOPRDivStats", 'todayVotes'));
    fastOPRDivStats = document.getElementById("fastOPRDivStats");
    exifInfo = document.getElementById("exifInfo");
    // Botões de função
    gmMS.presets();
    var vTotal = accepted + rejected;
    var totalHistory = Object.keys(FastOPRData['history']).length;
    var weekInvalid = weekValid = weekDuplicate = weekVotes = 0;
    if (totalHistory > 7) {
        for (var i = totalHistory - 8; i < totalHistory; i++) {
            gmMS.toConsole(FastOPRData['history'][i], true);
            if (typeof (FastOPRData['history'][i].voteInvalid) != 'undefined') {
                weekInvalid += FastOPRData['history'][i].voteInvalid;
            }
            if (typeof (FastOPRData['history'][i].voteValid) != 'undefined') {
                weekValid += FastOPRData['history'][i].voteValid;
            }
            if (typeof (FastOPRData['history'][i].voteDuplicate) != 'undefined') {
                weekDuplicate += FastOPRData['history'][i].voteDuplicate;
            }
        }
        weekVotes = weekInvalid + weekValid + weekDuplicate;
    }
    var portalCache = Object.keys(FastOPRData['candidates']).length;
    if (portalCache > 1100) {
        alert(translation["dangerCacheSize"]);
        window.location.assign("/");
    }
    fastOPRDivStats.insertAdjacentHTML("beforeEnd",
            "<ul><li>Today: " + (FastOPRData['statistics'].voteValid + FastOPRData['statistics'].voteInvalid)
            + " votes</li><li>Last 7 days: " + weekVotes
            + " votes</li>"

            + (vTotal < 10000 ? "<li>Next OPR badge in <b>" + ((vTotal > 4999 ? 10000 : (vTotal > 2499 ? 5000 : (vTotal > 749 ? 2500 : (vTotal > 99 ? 750 : 100)))) - vTotal) + "</b> processed portals</li>" : "My God you vote a lot, congrats !!!")

            + "<li><span class=''>Portals in cache: " + portalCache + "</span>"
            + "</li></ul>"
            );
    try {
        fastOPRDivStats.appendChild(exifInfo);
    } catch (err) {

    }
    //aqui
    // Todo: Adicionar DIV e colocar o botão de submit dentro para otimizar espaço colocando os presets +5 ao lado
};

gmMS.autoNext = function () {
    var modalWindow = document.getElementsByClassName("modal-body ng-scope");
    if (typeof (modalWindow[0]) != 'undefined' && modalWindow[0] != null && typeof (redir) === 'undefined') {
        window.clearInterval(window.gotoNext);
        redir = true;
        gmMS.fastOPRUpdateData();
        if (autoRedir === true) {
            window.location.assign("/recon");
        }
        gmMS.toConsole(FastOPRData['statistics'], true);
    }
};

gmMS.externalSites = function (site) {
    window.open((site === 'intel' ? 'https://www.ingress.com/intel?ll=' + pageData.lat + "," + pageData.lng + '&z=17' :
            (site === 'osm' ? 'https://www.openstreetmap.org/?mlat=" + pageData.lat + "&mlon=" + pageData.lng + "&zoom=16'
                    : 'https://bing.com/maps/default.aspx?cp=" + pageData.lat + "~" + pageData.lng + "&lvl=16&style=a')), '_blank');
};

gmMS.additionalMaps = function () {
    if (typeof (FastOPRData.pageData) !== 'undefined') {
// adding map buttons
        mapButtons = [
            gmMS.button('intel', gmMS.image('intel'), 'gmMS.externalSites("intel")', 'Show in Intel Site')
                    , gmMS.button('duvida', gmMS.image('ask-help'), 'gmMS.askHelp()', 'Ask Help')
                    , gmMS.button('pedidook', gmMS.image('ask-approve'), 'gmMS.askApprove()', 'Ask to approve')
                    , gmMS.button('rejected', gmMS.image('ask-reject'), 'gmMS.askReject()', 'Ask to reject')
                    , gmMS.button('bing', gmMS.image('bing'), 'gmMS.externalSites("bing")', 'Show in Bing Maps')
                    , gmMS.button('osm', gmMS.image('osm'), 'gmMS.externalSites("osm")', 'Show in Open Street Maps')
        ];
        // more map buttons in a dropdown menu
        mapDropdown = [
            "<li><a target='_blank' href='https://wego.here.com/?map=" + pageData.lat + "," + pageData.lng + ",17,satellite'>HERE maps</a></li>",
            "<li><a target='_blank' href='http://wikimapia.org/#lat=" + pageData.lat + "&lon=" + pageData.lng + "&z=16'>Wikimapia</a></li>",
            "<li role='separator' class='divider'></li>",
            // national maps
            "<li><a target='_blank' href='http://map.geo.admin.ch/?swisssearch=" + pageData.lat + "," + pageData.lng + "'>CH - Swiss Geo Map</a></li>",
            "<li><a target='_blank' href='http://maps.kompass.de/#lat=" + pageData.lat + "&lon=" + pageData.lng + "&z=17'>DE - Kompass.maps</a></li>",
            "<li><a target='_blank' href='https://geoportal.bayern.de/bayernatlas/index.html?X=" + pageData.lat + "&Y=" + pageData.lng + "&zoom=14&lang=de&bgLayer=luftbild&topic=ba&catalogNodes=122'>DE - BayernAtlas</a></li>",
            "<li><a target='_blank' href='https://maps.yandex.ru/?text=" + pageData.lat + "," + pageData.lng + "'>RU - Yandex</a></li>",
            "<li><a target='_blank' href='https://www.hitta.se/kartan!~" + pageData.lat + "," + pageData.lng + ",18z/tileLayer!l=1'>SE - Hitta.se</a></li>",
            "<li><a target='_blank' href='https://kartor.eniro.se/?c=" + pageData.lat + "," + pageData.lng + "&z=17&l=nautical'>SE - Eniro Sjökort</a></li>"
        ];
        divLeftContainer.insertAdjacentHTML("beforeEnd", "<div><div class='btn-group'>" + mapButtons.join("")
                //+ "<div class='button btn btn-primary dropdown'><span class='caret'></span><ul class='dropdown-content dropdown-menu'>" + mapDropdown.join("") + "</div>"
                + "</div>"
                );
    }
};

gmMS.presets = function () {
    fastVoteButtons = ["<button onclick='gmMS.setVote(5);' id='vote5' class='button btn btn-default textButton' data-tooltip='Simple Perfect'>+5</button>"
                , "<button onclick='gmMS.setVote(3);' id='vote3' class='button btn btn-default textButton' data-tooltip='Moreless'>+3</button>"
                , gmMS.imageButton("church+", 'church', 'Like I understand the rules, this portal NEED to be accepted.', 5)
                , gmMS.imageButton("church-", 'church-minus', 'Like I understand the rules, this portal NEED to be accepted, BUT I think this is not representative this type of church change your location very fast here on Brazil.')
                , gmMS.imageButton("graffitti+", 'graffiti', 'Like I understand the rules, this portal NEED to be accepted, and it is a very coool graffitti.', 5)
                , gmMS.imageButton("sculpture+", 'sculpture', 'I think this will be a good portal.', 5)
                , gmMS.imageButton("sport+", 'sport', 'Its a sport structure. So I understand, by NIA rules I need to approve this portal.', 5)
                , gmMS.imageButton("post", 'mail', 'Its a Post Office. So I understand, by NIA rules I need to approve this portal.')
                , gmMS.imageButton("public+", 'government', 'This is a government building and not is related to emergency services. So, by the rules, I think this is a good portal candidate. ', 5)
                , gmMS.imageButton("playground+", 'playground', 'APPROVED because +NIAOps memorandum: candidate is in a park or community gathering place.', 5)
                , gmMS.imageButton("Water Tower", 'watertower+', 'Water tower - ACCEPT if accessible without entering a restricted area, is uniquely decorated, or are otherwise a notable monument.', 4)
                , gmMS.imageButton("shopping mall", 'shopping-mall', 'Like I understand the rules, this portal NEED to be accepted because is a community place.', 5)
                , gmMS.imageButton("embassy", 'embassy', 'Like I understand the rules, this portal NEED to be accepted because is a community place.', 5)
    ];
//    submitDiv.insertAdjacentHTML("beforeEnd", "<div class='left' style='text-align: left'>" + fastVoteButtons.join("") + "</div>");
// Preset de justificativa com voto
    textButtons = [
        gmMS.imageButton("photo", 'bad-photo', 'Low quality photo. I think this portal cannot be accepted because this.', 1)
                , gmMS.imageButton("nature", 'nature', 'It is a picture of nature|very common place, not meeting like minimum rules.')
                , gmMS.imageButton("cemetery", 'cemetery', 'Cemetery - REJECTED because +NIAOps memorandum: REJECT unless the cemetery is historical or has special significance in the community (see guidelines for gravestones/markers). ', 1)
                , gmMS.imageButton("children problems", 'guardianship-council', 'Its a public building related with children\'s sensitive moments of her lives.', 1)
                , gmMS.imageButton("watertower-", 'watertower-', 'Water tower - REJECTED because +NIAOps memorandum: this tower is on restricted area, not is uniquely decorated, and not is a notable monument.', 1)
                , gmMS.imageButton("bad-graffitti", 'bad-graffitti', 'Its a very low quality graffitti. I think this is not a good portal.')
                , gmMS.imageButton("playground-", 'bad-playground', 'REJECTED because +NIAOps memorandum: candidate is in a park or community gathering place, but is a part of all. I undestand the required is aprove the park/sport area, not a part of him.', 2)
                , gmMS.imageButton("plate", 'plate', 'Reject because +NIAOps memorandum: PLATE - REJECT unless for a notable member of the community.')
                , gmMS.imageButton("temp", 'temporary', 'Its a seasonal or temporary display or item.')
                , gmMS.imageButton("streetview", 'streetview', 'This photo is captured using the STREET VIEW. Its not a VALID PHOTO.', 1)
                // Botões que reprovam
                , gmMS.reproveButton("private", 'Private', 'Appear is located on private residential property. Probably only Locals have access and is against the rules.')
                , gmMS.reproveButton("private", 'Internal', 'Its not possible agree with this portal because is located in internal private property. Without confirmation of street view.')
                , gmMS.reproveButton("insecure", 'Insecure', 'This portal is on a INSECURE AREA, because this is not a good portal.')
                , gmMS.reproveButton("bad", 'Bad', 'Very bad description.')
                , gmMS.reproveButton("emergency", 'Emergency', 'This portal can obstruct the driveway of emergency services (police, firefighters, medical, etc).')
                , gmMS.reproveButton("person", 'Person', 'This photo contain people.')
                , gmMS.reproveButton("primary", 'School', 'This portal is located on primary/secundary school property.')
                , gmMS.reproveButton("fake", 'Fake', 'Probably is a fake photo.')
                // Botões que adicionam comentários somente

                , gmMS.reproveButton("wrongpoi-", "POI", "The photo is valid for a portal, but the POI position is very wrong.")
                , gmMS.reproveButton("representative", 'Representative', 'I dont think this can be a portal. Its very regular and not representative in Ingress scope.')
                , gmMS.reproveButton("duplicate", 'Duplicate', 'I think is dupplicated with of one have previously reviewed.')
                , gmMS.newButton("unsure+", "Unsure+", "Its not possible to check using google information, but if is real I think this is a good portal candidate")
                , gmMS.newButton("unsure-", "Unsure-", "Its not possible to check using google information, I prefer refuse this portal.")
                //, "<button onclick='gmMS.standardMsg(this);' id='representative' class='button btn btn-default textButton' data-tooltip='I dont think this can be a portal. Its very regular and not representative in Ingress scope.'>Representative</button>"
                , "<button onclick='gmMS.standardMsg(this);' id='company' class='button btn btn-default textButton' data-tooltip='It`s a regular a company advertisement.'>Company</button>"
//                , "<button onclick='gmMS.standardMsg(this);' id='duplicate' class='button btn btn-default textButton' data-tooltip='I think is dupplicated with of one have previously reviewed.'>Dupplicated</button>"
                , "<button onclick='gmMS.standardMsg(this);' id='close' class='button btn btn-default textButton' data-tooltip='Its very close to another portal, but is unique'>Unique</button>"
                //"<button onclick='gmMS.standardMsg(this);' id='standard' class='button btn btn-default textButton' data-tooltip='Its a standard place. This type of place apear exactly same in many locations. I think is not a good portal'>Standard</button>",

                , "<br>"
                , gmMS.newButton("streetviewOld", "Old Street", "The portal is here, but street view image is very old.")
                , "<button onclick='gmMS.standardMsg(this);' id='clear' class='button btn btn-default textButton' data-tooltip='Clears the comment box'>Clear</button>"
                //Probably fake photo. Many times in this same area I receive fake photos.. its possible add a code verification or some liked for this user ? I think can be the same people... A LOT of invalid portals in this area!
    ];
    //divBComments = document.createElement('div');
    submitDiv.insertAdjacentHTML("beforeEnd", "<div class='left' style='text-align: left'>" + fastVoteButtons.join("") + "</div>");
    row2Right.insertAdjacentHTML("beforeEnd", "<div class='left' style='text-align: left'>" + textButtons.join("") + "</div>");
    gmMS.showControls(true);
//    row2Right.insertAdjacentHTML("beforeEnd", "<div class='left' style='text-align: left'>" + textButtons.join("") + "</div>");
};

gmMS.standardMsg = function (obj) {
//var textBox = document.getElementById("commentTextArea");
    if (typeof (textBox) === null) {
        gmMS.toConsole('Tentando pelo metodo 2... ', true);
        var textBox = w.document.querySelector("#row2Right > textarea");
    }
    ansController.formData.comment = obj.getAttribute('data-tooltip');
    if (typeof (textBox) !== null && typeof (textBox) !== 'undefined') {
        gmMS.toConsole(typeof (textBox), true);
        gmMS.toConsole(typeof (textBox), true);
        textBox.value += obj.getAttribute('data-tooltip');
        textBox.focus();
    }
    if (obj.id == "clear") {
        textBox.value = "";
    } else {
        vote = parseInt(obj.getAttribute('vote')) || 0;
        if (vote > 0) {
            gmMS.setVote(parseInt(vote));
            if (ansController.formData.quality === "1") {
                ansController.showLowQualityModal();
            }
            inputWhatIs.value = obj.id.replace("+", "").replace("-", "");
            inputWhatIs.focus();
        }
        switch (obj.id) {
            case "private":
            case "bad":
            case "insecure":
            case "emergency":
            case "person":
            case "temp":
            case "fake":
            case "nature":
            case "primary":
            case "plate":
            case "bad-graffitti":
            case "representative":
            case "duplicate":
                ansController.formData.quality = "1";
                ansController.showLowQualityModal();
                inputWhatIs.value = obj.id.replace("+", "").replace("-", "");
                break;
            case "playground+":
            case "public+":
            case "sport+":
            case "post":
            case "graffitti+":
            case "sculpture+":
            case "church+":
            case "statue+":
                gmMS.setVote(5);
                ansController.formData.quality = ((obj.id === "post") ? "4" : "5");
                ansController.formData.uniqueness = ((obj.id === "post") ? "1" : "5");
                inputWhatIs.value = obj.id.replace("+", "").replace("-", "").replace("_", " ");
                inputWhatIs.focus();
                break;
            case "church-":
                gmMS.setVote(5);
                ansController.formData.cultural = "3";
                ansController.formData.uniqueness = "1";
                ansController.formData.quality = "4";
                inputWhatIs.value = obj.id.replace("+", "").replace("-", "");
                inputWhatIs.focus();
                break;
            case "wrongpoi":
            case "unsure-":
                gmMS.setVote(1);
                ansController.formData.quality = "2";
                ansController.formData.location = "1";
                break;
            case "company":
                gmMS.setVote(3);
                ansController.formData.quality = "2";
                ansController.formData.location = ((obj.id === "company") ? "5" : "3");
                break;
            case "unsure+":
                gmMS.setVote(3);
                break;
            default:
        }
    }

};
gmMS.setVote = function (level) {
    ansController.formData.quality = level.toString();
    ansController.formData.uniqueness = level.toString();
    ansController.formData.cultural = level.toString();
    ansController.formData.description = level.toString();
    if (level > 4) {
        ansController.formData.location = level.toString();
    }
    ansController.formData.safety = "5";
    textBox.focus();
    ansController.readyToSubmit();
//        ansController.showLowQualityModal();
};


gmMS.approveButton = function (id, caption, tooltip) {
    return "<button onclick='gmMS.standardMsg(this);' id='" + id + "' class='button btn btn-default textButton approveButton' data-tooltip='" + tooltip + "'>" + caption + "</button>";
};
gmMS.imageButton = function (id, image, tooltip, vote) {
    return gmMS.button(id, "<img src='" + window.baseURL + "images/" + image + ".png'>", 'gmMS.standardMsg(this'
            + (typeof (vote) !== 'undefined' ? "," + vote : '') + ');', tooltip, "", "vote='" + vote + "'");
};
gmMS.image = function (name) {
    return "<img src='" + window.baseURL + "images/" + name + ".png'>";
};
gmMS.button = function (id, caption, onclick, tooltip, className, extra) {
    return "<button onclick='" + onclick + ";' id='" + id
            + "' class='button btn btn-default textButton " + (typeof (className) === 'undefined' || className === "" ? 'linkButton' : className) + "'  data-tooltip='"
            + tooltip + "' title='" + tooltip + "' " + (typeof (extra) !== 'undefined' ? " " + extra : "") + ">" + caption + "</button>";
};

gmMS.reproveButton = function (id, caption, text) {
    return gmMS.button(id, caption, 'gmMS.standardMsg(this);', text, 'reproveButton');
    //return "<button onclick='gmMS.standardMsg(this);' id='" + id + "' class='button btn btn-default textButton reproveButton' data-tooltip='" + text + "'>" + caption + "</button>";
};

gmMS.newButton = function (id, caption, text) {
    return "<button onclick='gmMS.standardMsg(this);' id='" + id + "' class='button btn btn-default textButton' data-tooltip='" + text + "'>" + caption + "</button>";
};

gmMS.askHelp = function () {
    gmMS.copy(
            gmMS.getString("askHelp").replace("$1", FastOPRData.pageData.title)
            + "\nURL: " + FastOPRData.pageData.fullImageUrl
            + "\nIntel: https://www.ingress.com/intel?ll=" + FastOPRData.pageData.lat + "," + FastOPRData.pageData.lng + "&z=17"
            + "\nGoogle Maps: https://www.google.com/maps?q=@" + FastOPRData.pageData.lat + "," + FastOPRData.pageData.lng + ""
            );
};
gmMS.askApprove = function () {
    gmMS.copy(
            gmMS.getString("askApprove").replace("$1", FastOPRData.pageData.title)
            //(userLang === "pt-BR" ? "Pessoal, conheço a área e estou confirmando que o candidato a portal '" + FastOPRData.pageData.title + "' EXISTE e solicito que VOTEM 5.6 nele ok ? "
            //        : "Guys , I know the area and I am confirming that the portal candidate '" + FastOPRData.pageData.title + "' EXISTS and request to you VOTE 5 stars on it ok?")
            + "\nURL: " + FastOPRData.pageData.fullImageUrl
            + "\nIntel: https://www.ingress.com/intel?ll=" + FastOPRData.pageData.lat + "," + FastOPRData.pageData.lng + "&z=17"
            + "\nGoogle Maps: https://www.google.com/maps?q=@" + FastOPRData.pageData.lat + "," + FastOPRData.pageData.lng + ""
            );
};
gmMS.askReject = function () {
    gmMS.copy(
            gmMS.getString("askReject").replace("$1", FastOPRData.pageData.title)
//            (userLang === "pt-BR" ? "------- CANDIDATO INVALIDO A PORTAL ------ \n Pessoal, o candidato a portal '" + FastOPRData.pageData.title + "' é INVALIDO e solicito que RECUSEM com 1 estrela ou DUPLICADO "
            //                  : "Guys, the portal candidate '" + FastOPRData.pageData.title + "' is INVALID and request to you REFUSE with 1 star or DUPLICATE")
            + "\nURL: " + FastOPRData.pageData.fullImageUrl
            + "\nIntel: https://www.ingress.com/intel?ll=" + FastOPRData.pageData.lat + "," + FastOPRData.pageData.lng + "&z=17"
            + "\nGoogle Maps: https://www.google.com/maps?q=@" + FastOPRData.pageData.lat + "," + FastOPRData.pageData.lng + "\n Motivo: "
            );
};
gmMS.copy = function (text) {
// standard way of copying
    var textArea = document.createElement('textarea');
    textArea.setAttribute('style', 'width:1px;border:0;opacity:0;');
    document.body.appendChild(textArea);
    textArea.value = text;
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Help text copied! Paste where you need it.');
};

gmMS.portalRange = function () {
//gmMS.toConsole(subController, true);
//gmMS.toConsole(subController.map, true);
    var validRange = new google.maps.Circle({
        strokeColor: '#e9f400',
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: '#414401',
        fillOpacity: 0.35,
        map: subController.map,
        center: {lat: pageData.lat, lng: pageData.lng},
        radius: 40
    });
    var validRange = new google.maps.Circle({
        strokeColor: '#e9f400',
        strokeOpacity: 0.5,
        strokeWeight: 2,
        fillColor: '#414401',
        fillOpacity: 0.35,
        map: subController.map2,
        center: {lat: pageData.lat, lng: pageData.lng},
        radius: 40
    });
    var distanceMin = new google.maps.Circle({
        strokeColor: 'red',
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: 'red',
        fillOpacity: 0.35,
        map: subController.map,
        center: {lat: pageData.lat, lng: pageData.lng},
        radius: 25
    });
    var distanceMin2 = new google.maps.Circle({
        strokeColor: 'red',
        strokeOpacity: 0.7,
        strokeWeight: 3,
        fillColor: 'white',
        fillOpacity: 0.35,
        map: subController.map2,
        center: {lat: pageData.lat, lng: pageData.lng},
        radius: 25
    });
};
gmMS.setStrings = function () {
    versionDesc = "Main Script: " + w.fastOPRVersion + "<br>Common Script: " + version + "<br>";
    switch (userLang) {
        case "pt-BR":
            translation["askHelp"] = "Preciso de ajuda. Me confirmem por favor se o candidato a portal '$1' existe realmente ?";
            translation["askApprove"] = "Pessoal, conheço a área e estou confirmando que o candidato a portal '$1' EXISTE e solicito que VOTEM 5.6 nele ok ? ";
            translation["askReject"] = "------- CANDIDATO INVALIDO A PORTAL ------ \n Pessoal, o candidato a portal '$1' é INVALIDO e solicito que RECUSEM com 1 estrela ou DUPLICADO ";
            translation["loadFail"] = "<a href='/recon'>Recarregar</a><br>" + versionDesc + "Falha de carga.";
            translation["loadWait"] = versionDesc + "Aguardando carga completa do OPR...";
            translation["loadOk"] = versionDesc;
            translation["goPlay"] = "Sim... é chato... mas não tem mais portais para você votar neste momento... \nO que acha de jogar Ingress por uma hora e voltar?";
            translation["dangerCacheSize"] = "Quantidade máxima de portais em cache alcançada. \nRetornando ao HOME. \nAguarde 30 segundos antes de começar a votar para que o cache seja limpo.";
            break;
        default:
            translation["askHelp"] = "I need help. Please confirm if the portal candidate '$1' really exists?";
            translation["askApprove"] = "Guys , I know the area and I am confirming that the portal candidate '$1' EXISTS and request to you VOTE 5 stars on it ok?";
            translation["askReject"] = "Guys, the portal candidate '$1' is INVALID and request to you REFUSE with 1 star or DUPLICATE";
            translation["loadFail"] = "<a href='/recon'>Click to reload</a><br>" + versionDesc + "TIMEOUT... OPR NOT FULL LOADED....";
            translation["loadWait"] = versionDesc + "Waiting for OPR full load...";
            translation["loadOk"] = versionDesc;
            translation["goPlay"] = "Yes ... it's annoying ... but there are no more portals for you to vote for right now ... \nHow about playing Ingress for an hour and back?";
            translation["dangerCacheSize"] = "Maximum number of candidates in cache reached. \nReturning to HOME. \nWait 30 seconds before start to vote again. This is needed to clean old cache data.";
    }
};

// ------------------ End of functions -----------------------------------------

// Start the work...
gmMS.toConsole('Common version: ' + version, true);
try {
    w = typeof unsafeWindow == "undefined" ? window : unsafeWindow;
    gmMS.setStrings();
    topBar = (typeof topBar == "undefined" ? document.getElementsByClassName("navbar-collapse navbar-responsive-collapse collapse")[0] : topBar);
    topBar.children[1].classList.remove('container');
    var endPortals = document.getElementsByClassName("alert alert-danger ng-hide");
    gmMS.toConsole("Total de divs de alerta: " + endPortals.length, true);
    if (endPortals.length !== 2) {
        w.setTimeout(function () {
            alert(gmMS.getString("goPlay"));
            window.location.assign("/");
        }, 5000);
        exit;
    } else {
        var endPortals = document.getElementsByClassName("alert alert-danger");
        gmMS.toConsole("Total de divs de alerta 2: " + endPortals.length, true);

    }

    var vBody = w.document.body;
    mainStructure = gmMS.divTable(gmMS.divRow(
            gmMS.divCell("", "mainLeft", "mainCellLeft")
            + gmMS.divCell("", "mainCenter", "mainCellCenter")
            + gmMS.divCell(gmMS.div("Aguardando carga da página... não vote ainda!", "fastOPRMSG2"), "mainRight", "mainCellRight")), "mainTable");
    vBody.insertAdjacentHTML('afterBegin', mainStructure);
    divLeftContainer = document.getElementById('mainLeft');
    mainCenter = document.getElementById("mainCenter");
    divRightContainer = document.getElementById('mainRight');
    gmMS.getTextBox();
    divMessage = document.getElementById('fastOPRMSG2');
} catch (err) {
}
;
waitCommon = setInterval(function () {
    if (typeof (gmMS) !== "undefined") {
        window.baseURL = "https://everyz.org/OPRPlus/";
        clearInterval(waitCommon);
        // Add New Styles
        var FastOPRCSS = document.createElement("link");
        FastOPRCSS.setAttribute("rel", "stylesheet");
        FastOPRCSS.setAttribute("type", "text/css");
        FastOPRCSS.setAttribute("href", window.baseURL + "FastOPR.css?p_ver=" + version);
        gmMS.getUserInfo();
        gmMS.fastOPRStorage();

        document.getElementsByTagName("head")[0].appendChild(FastOPRCSS);
        // Init Angular
        gmMS.checkAngularJS();
        gmMS.gotoNext = setInterval(gmMS.autoNext, 300);
    }
}, 600);
