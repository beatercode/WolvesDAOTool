import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataSource } from '@angular/cdk/collections';
import { Observable, ReplaySubject } from 'rxjs';

class TokenMainInfo {
  public constructor(
    _split: string,
    _allocation: number,
    _sum: number,
    _cliff: number,
    _vesting: number,
    _monthToComplete: number,
    _tokensLocked: number,
    _tokensAddedMonthPostTGE: number,
    _tokensUnlockAtTGE: number,
    _tokenSplitMonthInfo: TokenSplitMonthInfo,
    _currentPrice: number,
    _marketCap: number
  ) {
    this.split = _split;
    this.allocation = _allocation;
    this.sum = _sum;
    this.cliff = _cliff;
    this.vesting = _vesting;
    this.monthToComplete = _monthToComplete;
    this.tokensLocked = _tokensLocked;
    this.tokensAddedMonthPostTGE = _tokensAddedMonthPostTGE;
    this.tokensUnlockAtTGE = _tokensUnlockAtTGE;
    this.tokenSplitMonthInfo = _tokenSplitMonthInfo;
    this.currentPrice = _currentPrice;
    this.marketCap = _marketCap;
  }
  split: string;
  allocation: number;
  sum: number;
  cliff: number;
  vesting: number;
  monthToComplete: number;
  tokensLocked: number;
  tokensAddedMonthPostTGE: number;
  tokensUnlockAtTGE: number;
  tokenSplitMonthInfo: TokenSplitMonthInfo;
  currentPrice: number;
  marketCap: number;
}

class TokenSplitMonthInfo {
  public constructor(
    _split: string,
    _tge?: any,
    _month1?: any,
    _month2?: any,
    _month3?: any,
    _month4?: any,
    _month5?: any,
    _month6?: any,
    _month7?: any,
    _month8?: any,
    _month9?: any,
    _month10?: any,
    _month11?: any,
    _month12?: any
  ) {
    if (!_tge) {
      this.split = _split;
      this.tge = 0;
      this.month1 = 0;
      this.month2 = 0;
      this.month3 = 0;
      this.month4 = 0;
      this.month5 = 0;
      this.month6 = 0;
      this.month7 = 0;
      this.month8 = 0;
      this.month9 = 0;
      this.month10 = 0;
      this.month11 = 0;
      this.month12 = 0;
    } else {
      this.split = _split;
      this.tge = _tge;
      this.month1 = _month1;
      this.month2 = _month2;
      this.month3 = _month3;
      this.month4 = _month4;
      this.month5 = _month5;
      this.month6 = _month6;
      this.month7 = _month7;
      this.month8 = _month8;
      this.month9 = _month9;
      this.month10 = _month10;
      this.month11 = _month11;
      this.month12 = _month12;
    }
  }
  split: string;
  tge: any;
  month1: any;
  month2: any;
  month3: any;
  month4: any;
  month5: any;
  month6: any;
  month7: any;
  month8: any;
  month9: any;
  month10: any;
  month11: any;
  month12: any;
}

const ELEMENT_DATA: TokenMainInfo[] = [];
const ELEMENT_DATA_M: TokenSplitMonthInfo[] = [];
const ELEMENT_DATA_V: TokenSplitMonthInfo[] = [];
class Tokenomics {
  public constructor(init?: Partial<Tokenomics>) {
    Object.assign(this, init);
  }
  public totalSupply: number;
  public speedRound: TokenMainInfo;
  public privateRound: TokenMainInfo;
  public publicSale: TokenMainInfo;
  public currentPrice: number;
  public marketCap: number;
}
class SplitActive {
  public constructor() {
    this.speedRound = false;
    this.privateRound = false;
    this.publicSale = false;
  }
  public speedRound: boolean;
  public privateRound: boolean;
  public publicSale: boolean;
}

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  f: FormGroup;
  loading = false;
  success = false;
  step = -1;
  tokenomics: Tokenomics = null;
  active: SplitActive = new SplitActive();

  setStep(index: number) {
    this.step = index;
  }

  handleData() {
    this.tokenomics = new Tokenomics(this.f.value);
    this.active.speedRound = this.isSplitValid(this.tokenomics.speedRound);
    this.tokenomics.speedRound = this.doMath(
      this.active.speedRound,
      this.tokenomics.totalSupply,
      this.tokenomics.speedRound
    );
    this.active.privateRound = this.isSplitValid(this.tokenomics.privateRound);
    this.tokenomics.privateRound = this.doMath(
      this.active.privateRound,
      this.tokenomics.totalSupply,
      this.tokenomics.privateRound
    );
    this.active.publicSale = this.isSplitValid(this.tokenomics.publicSale);
    this.tokenomics.publicSale = this.doMath(
      this.active.publicSale,
      this.tokenomics.totalSupply,
      this.tokenomics.publicSale
    );
    this.handleRow(this.active.speedRound, this.tokenomics.speedRound);
    this.handleRowMonth(
      this.active.speedRound,
      this.tokenomics.speedRound.tokenSplitMonthInfo
    );
    this.handleRow(this.active.privateRound, this.tokenomics.privateRound);
    this.handleRowMonth(
      this.active.privateRound,
      this.tokenomics.privateRound.tokenSplitMonthInfo
    );
    this.handleRow(this.active.publicSale, this.tokenomics.publicSale);
    this.handleRowMonth(
      this.active.publicSale,
      this.tokenomics.publicSale.tokenSplitMonthInfo
    );
    this.handleMultipleRowValue(this.tokenomics);
    this.dataSource.setData(ELEMENT_DATA);
    this.dataSourceMonth.setData(ELEMENT_DATA_M);
    this.dataSourceValue.setData(ELEMENT_DATA_V);
  }

  sumVariable(name: string, i: Tokenomics) {
    return (
      i.speedRound.tokenSplitMonthInfo[name] +
      i.privateRound.tokenSplitMonthInfo[name] +
      i.publicSale.tokenSplitMonthInfo[name]
    );
  }

  handleRow(_state: boolean, _info: TokenMainInfo) {
    var r = ELEMENT_DATA.filter((item) => item.split != _info.split);
    for (var i = ELEMENT_DATA.length; i > 0; i--) ELEMENT_DATA.pop();
    r.forEach(this.pushTableData);

    if (_state) ELEMENT_DATA.push(_info);
  }

  handleRowMonth(_state: boolean, _info: TokenSplitMonthInfo) {
    var r = ELEMENT_DATA_M.filter((item) => item.split != _info.split);
    for (var i = ELEMENT_DATA_M.length; i > 0; i--) ELEMENT_DATA_M.pop();
    r.forEach(this.pushTableDataMonth);

    if (_state) ELEMENT_DATA_M.push(_info);
  }

  handleRowValue(_info: TokenSplitMonthInfo) {
    var r = ELEMENT_DATA_V.filter((item) => {
      console.log(item.split + ' - ' + _info.split), item.split != _info.split;
    });
    for (var i = ELEMENT_DATA_V.length; i > 0; i--) ELEMENT_DATA_V.pop();
    r.forEach(this.pushTableDataMonth);

    ELEMENT_DATA_V.push(_info);
  }

  handleMultipleRowValue(_info: Tokenomics) {
    let arrInfo: TokenSplitMonthInfo[] = [];
    let liquiditySupply = this.createValueSplitMonthInfo_LiquiditySupply(
      this.tokenomics
    );
    let totalLS = this.createValueSplitMonthInfo_TotalLS(
      this.tokenomics,
      liquiditySupply
    );
    let percentPstLS = this.createValueSplitMonthInfo_PercentPastLS(
      this.tokenomics,
      liquiditySupply,
      totalLS
    );
    let percentCurrentLS = this.createValueSplitMonthInfo_PercentCurrentLS(
      this.tokenomics,
      liquiditySupply,
      totalLS
    );
    let marketCapIfPriceStayTheSame = this.createValueSplitMonthInfo_MarketCap(
      this.tokenomics,
      totalLS
    );
    let priceIfMarketCapStayTheSame = this.createValueSplitMonthInfo_Price(
      this.tokenomics,
      totalLS
    );
    arrInfo.push(liquiditySupply);
    arrInfo.push(totalLS);
    arrInfo.push(percentPstLS);
    arrInfo.push(percentCurrentLS);
    arrInfo.push(marketCapIfPriceStayTheSame);
    arrInfo.push(priceIfMarketCapStayTheSame);

    for (var i = ELEMENT_DATA_V.length; i > 0; i--) ELEMENT_DATA_V.pop();
    arrInfo.forEach(this.pushTableDataValue);
  }

  createValueSplitMonthInfo_Price(i: Tokenomics, totalLs: TokenSplitMonthInfo) {
    let ret: TokenSplitMonthInfo = new TokenSplitMonthInfo(
      'Toke price id MC stay the same'
    );
    if (!i.marketCap) return ret;
    ret.tge = totalLs.tge / i.marketCap;
    ret.month1 = totalLs.month1 / i.marketCap;
    ret.month2 = totalLs.month2 / i.marketCap;
    ret.month3 = totalLs.month3 / i.marketCap;
    ret.month4 = totalLs.month4 / i.marketCap;
    ret.month5 = totalLs.month5 / i.marketCap;
    ret.month6 = totalLs.month6 / i.marketCap;
    ret.month7 = totalLs.month7 / i.marketCap;
    ret.month8 = totalLs.month8 / i.marketCap;
    ret.month9 = totalLs.month9 / i.marketCap;
    ret.month10 = totalLs.month10 / i.marketCap;
    ret.month11 = totalLs.month11 / i.marketCap;
    ret.month12 = totalLs.month12 / i.marketCap;
    return ret;
  }

  createValueSplitMonthInfo_MarketCap(
    i: Tokenomics,
    totalLs: TokenSplitMonthInfo
  ) {
    let ret: TokenSplitMonthInfo = new TokenSplitMonthInfo(
      'Market Cap (MC) if price stay the same'
    );
    if (!i.currentPrice) return ret;
    ret.tge = totalLs.tge * i.currentPrice;
    ret.month1 = totalLs.month1 * i.currentPrice;
    ret.month2 = totalLs.month2 * i.currentPrice;
    ret.month3 = totalLs.month3 * i.currentPrice;
    ret.month4 = totalLs.month4 * i.currentPrice;
    ret.month5 = totalLs.month5 * i.currentPrice;
    ret.month6 = totalLs.month6 * i.currentPrice;
    ret.month7 = totalLs.month7 * i.currentPrice;
    ret.month8 = totalLs.month8 * i.currentPrice;
    ret.month9 = totalLs.month9 * i.currentPrice;
    ret.month10 = totalLs.month10 * i.currentPrice;
    ret.month11 = totalLs.month11 * i.currentPrice;
    ret.month12 = totalLs.month12 * i.currentPrice;
    return ret;
  }

  createValueSplitMonthInfo_PercentCurrentLS(
    i: Tokenomics,
    liquiditySupply: TokenSplitMonthInfo,
    totalLs: TokenSplitMonthInfo
  ) {
    let ret: TokenSplitMonthInfo = new TokenSplitMonthInfo(
      '% of current month LS'
    );
    ret.tge = 0;
    ret.month1 =
      liquiditySupply.month1 == 0 || totalLs.month1 == 0
        ? ''
        : (liquiditySupply.month1 / totalLs.month1) * 100 + '%';
    ret.month2 =
      liquiditySupply.month2 == 0 || totalLs.month2 == 0
        ? ''
        : (liquiditySupply.month2 / totalLs.month2) * 100 + '%';
    ret.month3 =
      liquiditySupply.month3 == 0 || totalLs.month3 == 0
        ? ''
        : (liquiditySupply.month3 / totalLs.month3) * 100 + '%';
    ret.month4 =
      liquiditySupply.month4 == 0 || totalLs.month4 == 0
        ? ''
        : (liquiditySupply.month4 / totalLs.month4) * 100 + '%';
    ret.month5 =
      liquiditySupply.month5 == 0 || totalLs.month5 == 0
        ? ''
        : (liquiditySupply.month5 / totalLs.month5) * 100 + '%';
    ret.month6 =
      liquiditySupply.month6 == 0 || totalLs.month6 == 0
        ? ''
        : (liquiditySupply.month6 / totalLs.month6) * 100 + '%';
    ret.month7 =
      liquiditySupply.month7 == 0 || totalLs.month7 == 0
        ? ''
        : (liquiditySupply.month7 / totalLs.month7) * 100 + '%';
    ret.month8 =
      liquiditySupply.month8 == 0 || totalLs.month8 == 0
        ? ''
        : (liquiditySupply.month8 / totalLs.month8) * 100 + '%';
    ret.month9 =
      liquiditySupply.month9 == 0 || totalLs.month9 == 0
        ? ''
        : (liquiditySupply.month9 / totalLs.month9) * 100 + '%';
    ret.month10 =
      liquiditySupply.month10 == 0 || totalLs.month10 == 0
        ? ''
        : (liquiditySupply.month10 / totalLs.month10) * 100 + '%';
    ret.month11 =
      liquiditySupply.month11 == 0 || totalLs.month11 == 0
        ? ''
        : (liquiditySupply.month11 / totalLs.month11) * 100 + '%';
    ret.month12 =
      liquiditySupply.month12 == 0 || totalLs.month12 == 0
        ? ''
        : (liquiditySupply.month12 / totalLs.month12) * 100 + '%';
    return ret;
  }

  createValueSplitMonthInfo_PercentPastLS(
    i: Tokenomics,
    liquiditySupply: TokenSplitMonthInfo,
    totalLs: TokenSplitMonthInfo
  ) {
    let ret: TokenSplitMonthInfo = new TokenSplitMonthInfo(
      '% of past month LS'
    );
    ret.tge = 0;
    ret.month1 =
      liquiditySupply.month1 == 0 || totalLs.tge == 0
        ? ''
        : (liquiditySupply.month1 / totalLs.tge) * 100 + '%';
    ret.month2 =
      liquiditySupply.month2 == 0 || totalLs.month1 == 0
        ? ''
        : (liquiditySupply.month2 / totalLs.month1) * 100 + '%';
    ret.month3 =
      liquiditySupply.month3 == 0 || totalLs.month2 == 0
        ? ''
        : (liquiditySupply.month3 / totalLs.month2) * 100 + '%';
    ret.month4 =
      liquiditySupply.month4 == 0 || totalLs.month3 == 0
        ? ''
        : (liquiditySupply.month4 / totalLs.month3) * 100 + '%';
    ret.month5 =
      liquiditySupply.month5 == 0 || totalLs.month4 == 0
        ? ''
        : (liquiditySupply.month5 / totalLs.month4) * 100 + '%';
    ret.month6 =
      liquiditySupply.month6 == 0 || totalLs.month5 == 0
        ? ''
        : (liquiditySupply.month6 / totalLs.month5) * 100 + '%';
    ret.month7 =
      liquiditySupply.month7 == 0 || totalLs.month6 == 0
        ? ''
        : (liquiditySupply.month7 / totalLs.month6) * 100 + '%';
    ret.month8 =
      liquiditySupply.month8 == 0 || totalLs.month7 == 0
        ? ''
        : (liquiditySupply.month8 / totalLs.month7) * 100 + '%';
    ret.month9 =
      liquiditySupply.month9 == 0 || totalLs.month8 == 0
        ? ''
        : (liquiditySupply.month9 / totalLs.month8) * 100 + '%';
    ret.month10 =
      liquiditySupply.month10 == 0 || totalLs.month9 == 0
        ? ''
        : (liquiditySupply.month10 / totalLs.month9) * 100 + '%';
    ret.month11 =
      liquiditySupply.month11 == 0 || totalLs.month10 == 0
        ? ''
        : (liquiditySupply.month11 / totalLs.month10) * 100 + '%';
    ret.month12 =
      liquiditySupply.month12 == 0 || totalLs.month11 == 0
        ? ''
        : (liquiditySupply.month12 / totalLs.month11) * 100 + '%';
    return ret;
  }

  createValueSplitMonthInfo_TotalLS(i: Tokenomics, l: TokenSplitMonthInfo) {
    let ret: TokenSplitMonthInfo = new TokenSplitMonthInfo('Total LS');
    ret.tge = l.tge;
    ret.month1 = ret.tge + l.month1;
    ret.month2 = ret.month1 + l.month2;
    ret.month3 = ret.month2 + l.month3;
    ret.month4 = ret.month3 + l.month4;
    ret.month5 = ret.month4 + l.month5;
    ret.month6 = ret.month5 + l.month6;
    ret.month7 = ret.month6 + l.month7;
    ret.month8 = ret.month7 + l.month8;
    ret.month9 = ret.month8 + l.month9;
    ret.month10 = ret.month9 + l.month10;
    ret.month11 = ret.month10 + l.month11;
    ret.month12 = ret.month11 + l.month12;
    return ret;
  }

  createValueSplitMonthInfo_LiquiditySupply(i: Tokenomics) {
    let ret: TokenSplitMonthInfo = new TokenSplitMonthInfo(
      'Liquidity Supply (LS) added'
    );
    ret.tge = this.sumVariable('tge', i);
    ret.month1 = this.sumVariable('month1', i);
    ret.month2 = this.sumVariable('month2', i);
    ret.month3 = this.sumVariable('month3', i);
    ret.month4 = this.sumVariable('month4', i);
    ret.month5 = this.sumVariable('month5', i);
    ret.month6 = this.sumVariable('month6', i);
    ret.month7 = this.sumVariable('month7', i);
    ret.month8 = this.sumVariable('month8', i);
    ret.month9 = this.sumVariable('month9', i);
    ret.month10 = this.sumVariable('month10', i);
    ret.month11 = this.sumVariable('month11', i);
    ret.month12 = this.sumVariable('month12', i);
    return ret;
  }

  doMath(a: boolean, s: number, i: TokenMainInfo) {
    if (!a) return i;
    i.tokenSplitMonthInfo = new TokenSplitMonthInfo(i.split);
    i.sum = (s / 100) * i.allocation;
    i.monthToComplete = i.cliff + i.vesting;
    i.tokenSplitMonthInfo.tge =
      i.tokensUnlockAtTGE > 0 ? (i.tokensUnlockAtTGE / 100) * i.sum : 0;
    i.tokensLocked = i.sum - i.tokenSplitMonthInfo.tge;
    i.tokensAddedMonthPostTGE = i.tokensLocked / i.vesting;
    i.tokenSplitMonthInfo.month1 = this.doMathMonth(1, i);
    i.tokenSplitMonthInfo.month2 = this.doMathMonth(2, i);
    i.tokenSplitMonthInfo.month3 = this.doMathMonth(3, i);
    i.tokenSplitMonthInfo.month4 = this.doMathMonth(4, i);
    i.tokenSplitMonthInfo.month5 = this.doMathMonth(5, i);
    i.tokenSplitMonthInfo.month6 = this.doMathMonth(6, i);
    i.tokenSplitMonthInfo.month7 = this.doMathMonth(7, i);
    i.tokenSplitMonthInfo.month8 = this.doMathMonth(8, i);
    i.tokenSplitMonthInfo.month9 = this.doMathMonth(9, i);
    i.tokenSplitMonthInfo.month10 = this.doMathMonth(10, i);
    i.tokenSplitMonthInfo.month11 = this.doMathMonth(11, i);
    i.tokenSplitMonthInfo.month12 = this.doMathMonth(12, i);

    return i;
  }

  doMathMonth(index: number, _i: TokenMainInfo) {
    return index < _i.cliff + 1
      ? 0
      : index > _i.monthToComplete
      ? 0
      : _i.tokensAddedMonthPostTGE;
  }

  pushTableData(item) {
    ELEMENT_DATA.push(item);
  }

  pushTableDataMonth(item) {
    ELEMENT_DATA_M.push(item);
  }

  pushTableDataValue(item) {
    ELEMENT_DATA_V.push(item);
  }

  isSplitValid(_info: TokenMainInfo) {
    if (_info.allocation != null && _info.allocation != 0) return true;
    return false;
  }

  isNumber(n) {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
  }

  formatIt(n) {
    if (!n || n == 0 || n == '0' || n == '' || n == 'NaN') return '';
    if (this.isNumber(n)) {
      return this.convertToInternationalCurrencySystem(
        this.toFixedIfNecessary(n, 2)
      );
    } else {
      return (
        this.convertToInternationalCurrencySystem(
          this.toFixedIfNecessary(n.replace('%', ''), 2)
        ) + '%'
      );
    }
  }

  hasPercentage(str) {
    return !str || String(str).trim() === '' || str == 'NaN'
      ? false
      : String(str).includes('%')
      ? true
      : false;
  }

  removePercentageFromNumber(str) {
    if (!str || String(str).trim() === '' || str == 'NaN') return '';
    if (this.isNumber(str)) return str;
    let ret = str.replace(/%/g, '');
    return ret;
  }

  convertToInternationalCurrencySystem(labelValue) {
    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e9
      ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(2) + 'B'
      : // Six Zeroes for Millions
      Math.abs(Number(labelValue)) >= 1.0e6
      ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(2) + 'M'
      : // Three Zeroes for Thousands
      Math.abs(Number(labelValue)) >= 1.0e3
      ? (Math.abs(Number(labelValue)) / 1.0e3).toFixed(2) + 'K'
      : Math.abs(Number(labelValue));
  }

  addPercent(n) {
    return n + '%';
  }

  toFixedIfNecessary(value, dp) {
    return +parseFloat(value).toFixed(dp);
  }

  isPercentage(stringa: string) {
    return stringa.toString().includes('%');
  }

  displayedColumns: string[] = [
    'split',
    'allocation',
    'sum',
    'cliff',
    'vesting',
    'monthToComplete',
    'tokensLocked',
    'tokensAddedMonthlyPostTGE',
    'tokensUnlockTGE',
  ];
  displayedColumnsMonth: string[] = [
    'split',
    'tge',
    'month1',
    'month2',
    'month3',
    'month4',
    'month5',
    'month6',
    'month7',
    'month8',
    'month9',
    'month10',
    'month11',
    'month12',
  ];
  dataToDisplay = [...ELEMENT_DATA];
  dataToDisplayMonth = [...ELEMENT_DATA_M];
  dataToDisplayValue = [...ELEMENT_DATA_V];
  dataSource = new TokenDataSource(this.dataToDisplay);
  dataSourceMonth = new TokenMonthDataSource(this.dataToDisplayMonth);
  dataSourceValue = new TokenValueDataSource(this.dataToDisplayMonth);

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.f = this.fb.group({
      totalSupply: 10000000, //null,
      speedRound: this.fb.group({
        split: 'speedRound',
        allocation: null,
        sum: null,
        cliff: null,
        vesting: null,
        monthComplete: null,
        tokensLocked: null,
        tokensAddedMonthlyPostTGE: null,
        tokensUnlockAtTGE: null,
        tokenSplitMonthInfo: this.fb.group({
          split: 'speedRound',
          tge: null,
          month1: null,
          month2: null,
          month3: null,
          month4: null,
          month5: null,
          month6: null,
          month7: null,
          month8: null,
          month9: null,
          month10: null,
          month11: null,
          month12: null,
        }),
      }),
      privateRound: this.fb.group({
        split: 'privateRound',
        allocation: null,
        sum: null,
        cliff: null,
        vesting: null,
        monthComplete: null,
        tokensLocked: null,
        tokensAddedMonthlyPostTGE: null,
        tokensUnlockAtTGE: null,
        tokenSplitMonthInfo: this.fb.group({
          split: 'privateRound',
          tge: null,
          month1: null,
          month2: null,
          month3: null,
          month4: null,
          month5: null,
          month6: null,
          month7: null,
          month8: null,
          month9: null,
          month10: null,
          month11: null,
          month12: null,
        }),
      }),
      publicSale: this.fb.group({
        split: 'publicSale',
        allocation: 100, //null,
        sum: null,
        cliff: 0, //null,
        vesting: 9, //null,
        monthComplete: null,
        tokensLocked: null,
        tokensAddedMonthlyPostTGE: null,
        tokensUnlockAtTGE: 50, //null,
        tokenSplitMonthInfo: this.fb.group({
          split: 'publicSale',
          tge: null,
          month1: null,
          month2: null,
          month3: null,
          month4: null,
          month5: null,
          month6: null,
          month7: null,
          month8: null,
          month9: null,
          month10: null,
          month11: null,
          month12: null,
        }),
      }),
      currentPrice: 0.5, //null,
      marketCap: 250000, //null,
    });
  }

  ngAfterContentInit() {
    this.handleData();
  }

  async submitHandler() {
    console.log(`submitted!`);
    this.success = true;
  }

  onKeyUp(x) {
    this.handleData();
  }
}

class TokenDataSource extends DataSource<TokenMainInfo> {
  private _dataStream = new ReplaySubject<TokenMainInfo[]>();

  constructor(initialData: TokenMainInfo[]) {
    super();
    this.setData(initialData);
  }

  connect(): Observable<TokenMainInfo[]> {
    return this._dataStream;
  }

  disconnect() {}

  setData(data: TokenMainInfo[]) {
    this._dataStream.next(data);
  }
}

class TokenMonthDataSource extends DataSource<TokenSplitMonthInfo> {
  private _dataStream = new ReplaySubject<TokenSplitMonthInfo[]>();

  constructor(initialData: TokenSplitMonthInfo[]) {
    super();
    this.setData(initialData);
  }

  connect(): Observable<TokenSplitMonthInfo[]> {
    return this._dataStream;
  }

  disconnect() {}

  setData(data: TokenSplitMonthInfo[]) {
    this._dataStream.next(data);
  }
}

class TokenValueDataSource extends DataSource<TokenSplitMonthInfo> {
  private _dataStream = new ReplaySubject<TokenSplitMonthInfo[]>();

  constructor(initialData: TokenSplitMonthInfo[]) {
    super();
    this.setData(initialData);
  }

  connect(): Observable<TokenSplitMonthInfo[]> {
    return this._dataStream;
  }

  disconnect() {}

  setData(data: TokenSplitMonthInfo[]) {
    this._dataStream.next(data);
  }
}
