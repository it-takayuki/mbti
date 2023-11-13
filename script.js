$(window).on('load resize', function() {
  let cntH = $(window).height() - $('header').innerHeight() - 24;
  $('.contents').css('height', cntH + 'px');
});

const $account = $('#account');
const $accountNote = $('#account-note');
  
const $judgeRight = $('.right');
const $judgeWrong = $('.wrap-wrong');

const rightSound = new Audio('correct.mp3');
const wrongSound = new Audio('incorrect.mp3');

let randomNumber;
let account;
let doneQuestions = [];
let rights;
let judge;
let tm;

if (localStorage.getItem('rights') !== null) {
  rights = JSON.parse(localStorage.getItem('rights'));
} else {
  rights = [];
}
  
const ACCOUNTS = [
  {group:'資産', account:'現金', accountNote:'（通貨と他社の小切手）'},
  {group:'資産', account:'普通預金', accountNote:'（銀行の普通預金）'},
  {group:'資産', account:'当座預金', accountNote:'（小切手や手形を決済する預金）'},
  {group:'資産', account:'受取手形', accountNote:'（受け取った手形）'},
  {group:'資産', account:'売掛金', accountNote:'（商品の未収金）'},
  {group:'資産', account:'貸付金', accountNote:'（他人に貸したお金）'},
  {group:'資産', account:'有価証券', accountNote:'（他社の株式や国債）'},
  {group:'資産', account:'繰越商品', accountNote:'（決算日に売れ残った商品）'},
  {group:'資産', account:'未収金', accountNote:'（商品以外の未収金）'},
  {group:'資産', account:'建物', accountNote:'（ビル、店舗、倉庫など）'},
  {group:'資産', account:'土地', accountNote:'（建物や投資目的の土地）'},
  {group:'資産', account:'備品', accountNote:'（事務用机やパソコン）'},
  {group:'資産', account:'車両運搬具', accountNote:'（車やオートバイ）'},
  {group:'資産', account:'特許権・著作権', accountNote:'（法律によって定められた権利）'},
  {group:'負債', account:'借入金', accountNote:'（他人に借りたお金）'},
  {group:'負債', account:'支払手形', accountNote:'（手形を支払った場合）'},
  {group:'負債', account:'買掛金', accountNote:'（商品の未納金）'},
  {group:'負債', account:'未払金', accountNote:'（商品以外の未納金）'},
  {group:'負債', account:'預り金', accountNote:'（一時的に預かった現金）'},
  {group:'負債', account:'引当金', accountNote:'（予想される将来の支出）'},
  {group:'純資産', account:'資本金', accountNote:'（株主からの出資金）'},
  {group:'純資産', account:'繰越利益剰余金', accountNote:'（会社が出した利益）'},
  {group:'純資産', account:'資本準備金', accountNote:'（資本金としない出資金）'},
  {group:'純資産', account:'利益準備金', accountNote:'（配当支払額10分の1の積立）'},
  {group:'純資産', account:'任意積立金', accountNote:'（任意の各種積立金）'},
  {group:'収益', account:'売上', accountNote:'（商品の売り上げ）'},
  {group:'収益', account:'受取利息', accountNote:'（預金についた利息）'},
  {group:'収益', account:'受取手数料', accountNote:'（委託販売の手数料）'},
  {group:'収益', account:'受取配当金', accountNote:'（他社の配当金）'},
  {group:'収益', account:'有価証券売却益', accountNote:'（有価証券の売却益）'},
  {group:'収益', account:'固定資産売却益', accountNote:'（固定資産の売却益）'},
  {group:'費用', account:'仕入', accountNote:'（仕入れた商品）'},
  {group:'費用', account:'給料', accountNote:'（従業員に支払った給料）'},
  {group:'費用', account:'通信費', accountNote:'（ハガキ代やネット接続費）'},
  {group:'費用', account:'旅費交通費', accountNote:'（交通費や出張宿泊費）'},
  {group:'費用', account:'水道光熱費', accountNote:'（水道料金や電気代）'},
  {group:'費用', account:'広告宣伝費', accountNote:'（会社の宣伝のための出費）'},
  {group:'費用', account:'保険料', accountNote:'（各種保険料）'},
  {group:'費用', account:'支払利息', accountNote:'（借入金に支払う利息）'},
  {group:'費用', account:'支払家賃', accountNote:'（家賃）'},
  {group:'費用', account:'図書費', accountNote:'（新聞・雑誌・書籍代）'},
  {group:'費用', account:'接待交際費', accountNote:'（取引の接待にかかる費用）'},
  {group:'費用', account:'有価証券売却損', accountNote:'（有価証券の売却損）'},
  {group:'費用', account:'固定資産売却損', accountNote:'（固定資産の売却損）'},
  {group:'費用', account:'減価償却費', accountNote:'（経年劣化分の費用）'},
];

let accounts = ACCOUNTS.concat();

function changeQuestion() {
  randomNumber = Math.floor(Math.random() * accounts.length);
  while (doneQuestions.includes(randomNumber)) {
    randomNumber = Math.floor(Math.random() * accounts.length);
  }
  doneQuestions.push(randomNumber);
  account = accounts[randomNumber];
  $account.text(account['account']);
  $accountNote.text(account['accountNote']);
}

function getYetArray() {
  rights.forEach(function(value) {
    delete accounts[value];
  });
  accounts = accounts.filter(function (x) {
    return x !== undefined;
  });
}

$('.boki-start').on('click', function() {
  $('.top-screen').hide();
  $('.quiz-screen').show();
  if (rights.length !== ACCOUNTS.length && rights.length !== 0) {
    const startSelect = window.confirm('未正解の問題のみを解きますか？');
    if (startSelect) {
      doneQuestions = [];
      accounts = ACCOUNTS.concat();
      getYetArray();
      accountsCount = accounts.length;
      changeQuestion();
      $('#q-remaining').text(accountsCount);
    }
  }
  tm = setTimeout(function() {
    judge = false;
    judgment();
  }, 3000);
});

let accountsCount = accounts.length;
changeQuestion();
$('#q-remaining').text(accountsCount);

function finish() {
  clearTimeout(tm);
  $('#before-finish').hide();
  $('#back-btn').show();
  $('.main').hide();
  $('.result').css('display', 'flex');
  if (rights.length === ACCOUNTS.length || rights.length === 0) {
    $('#q-yet').hide();
  } else {
    $('#q-yet').show();
  }
  $('#rights-rate').text(Math.floor(rights.length / ACCOUNTS.length * 100));
  const yetCount = ACCOUNTS.length - rights.length;
  function drawChart() {
    let dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', '判定');
    dataTable.addColumn('number', '数');
    dataTable.addRows([
      ['', {v: rights.length, f: rights.length + '問'}],
      ['', {v: yetCount, f: yetCount + '問'}]
    ]);
    const options = {
      chartArea: {
        left: 30,
        right: 30,
        top: 30,
        bottom: 30,
      },
      height: 300,
      width: 300,
      legend: {
        position: 'none',
      },
      tooltip: {
        text: 'both',
        textStyle: {
          fontSize: 15,
        },
        showColorCode: 'true',
      },
      pieSliceText: 'label',
      pieHole: .6,
      slices: {
        0: {
          color: '#1E1E74',
            textStyle: {
              color: '#fff', 
              fontSize: 13, 
              bold: true, 
            },
        },
        1: {
          color: '#E5E5E5',
            textStyle: {
              color: '#fff', 
              fontSize: 13, 
            },
        },
      },
    };
    let chart = new google.visualization.PieChart(document.getElementById('pie_chart'));
    chart.draw(dataTable, options);
  }
  google.charts.load('current', {
    'packages': ['corechart']
  });
  google.charts.setOnLoadCallback(drawChart);
}

function judgment() {
  clearTimeout(tm);
  if (judge) {
    if (!rights.includes(ACCOUNTS.indexOf(account))) rights.push(ACCOUNTS.indexOf(account));
    rightSound.play();
    $judgeRight.show();
  } else if ($judgeRight.is(':hidden')) {
    if (rights.includes(ACCOUNTS.indexOf(account))) rights.splice(rights.indexOf(ACCOUNTS.indexOf(account)), 1);
    wrongSound.play();
    $judgeWrong.show();
  }
  localStorage.setItem('rights', JSON.stringify(rights));
  if (accountsCount > 1) accountsCount--;
  setTimeout(function() {
    if (judge) {
      $judgeRight.hide();
    } else {
      $judgeWrong.hide();
    }
    if (doneQuestions.length === accounts.length) {
      finish();
    } else {
      changeQuestion();
      $('#q-remaining').text(accountsCount);
      tm = setTimeout(function() {
        judge = false;
        judgment();
      }, 3000);
    }
  }, 500);
}

$('.btn').on('click', function() {
  judge = $(this).text() === account['group'];
  judgment();
});

$('#suspend-btn').on('click', function() {
  finish();
});

$('#back-btn').on('click', function() {
  location.reload();
});

$('.q-again').on('click', function() {
  $('.result').hide();
  $('#before-finish').show();
  $('#back-btn').hide();
  $('.main').show();
  doneQuestions = [];
  accounts = ACCOUNTS.concat();
  if ($(this).attr('id') === "q-yet") {
    getYetArray();
  }
  accountsCount = accounts.length;
  changeQuestion();
  $('#q-remaining').text(accountsCount);
  tm = setTimeout(function() {
    judge = false;
    judgment();
  }, 3000);
});
  