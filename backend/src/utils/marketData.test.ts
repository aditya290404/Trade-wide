import { STOCKS, getLivePrice, getCurrentMarketPrices } from './marketData';

describe('Market Data Utils', () => {
  it('should have a predefined list of 5 stocks', () => {
    expect(STOCKS.length).toBe(5);
    expect(STOCKS[0]?.symbol).toBe('AAPL');
  });

  it('getLivePrice should return a valid number near the base price', () => {
    const basePrice = 100;
    const price = getLivePrice(basePrice);
    expect(typeof price).toBe('number');
    expect(price).toBeGreaterThan(90);
    expect(price).toBeLessThan(110);
  });

  it('getCurrentMarketPrices should return a record of all stock symbols', () => {
    const prices = getCurrentMarketPrices();
    expect(Object.keys(prices).length).toBe(STOCKS.length);
    expect(prices).toHaveProperty('AAPL');
    expect(prices).toHaveProperty('TSLA');
    expect(typeof prices['AAPL']).toBe('number');
  });
});
