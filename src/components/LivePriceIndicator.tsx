/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Info, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchOfficialOnionPrice, MarketPriceData } from '../utils/marketPriceService';

interface LivePriceIndicatorProps {
  compact?: boolean;
}

export const LivePriceIndicator: React.FC<LivePriceIndicatorProps> = ({ compact = false }) => {
  const [priceData, setPriceData] = useState<MarketPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const loadPrice = async () => {
    setLoading(true);
    try {
      const data = await fetchOfficialOnionPrice();
      setPriceData(data);
    } catch (err) {
      console.warn('Failed to load official price:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrice();
  }, []);

  if (loading && !priceData) {
    return (
      <div className="bg-[#0b2013]/80 border border-[#24462f] rounded-2xl p-3 text-xs text-[#a9bfa9] flex items-center gap-2">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#f2c14e]" />
        <span>Fetching official onion market data...</span>
      </div>
    );
  }

  if (!priceData) {
    return (
      <div className="bg-[#0b2013]/80 border border-[#a93b2e]/40 rounded-2xl p-3 text-xs text-[#fca5a5] flex items-center justify-between">
        <span>MSP / Mandi price currently unavailable</span>
        <button onClick={loadPrice} className="underline text-white cursor-pointer ml-2">Retry</button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="bg-[#0b2013]/90 border border-[#24462f] hover:border-[#386b46] rounded-2xl p-3.5 sm:p-4 text-white shadow-md transition-all">
        <div className="flex items-center justify-between gap-2 border-b border-[#1b3d26] pb-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#d1e0d2] font-heading flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#f2c14e]" />
              <span>ONION MARKET MODAL PRICE</span>
            </span>
            <button
              type="button"
              onClick={() => setShowInfo(!showInfo)}
              className="text-[#a9bfa9] hover:text-[#f2c14e] transition cursor-pointer p-0.5"
              title="Official MSP & Mandi Clarification"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Live vs Verified Bulletin status indicator */}
          <div className="flex items-center gap-1.5">
            {priceData.isLive ? (
              <span className="inline-flex items-center gap-1 bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
                <span>LIVE API</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-[#f2c14e]/20 text-[#f2c14e] border border-[#f2c14e]/40 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f2c14e]" />
                <span>OFFICIAL BULLETIN</span>
              </span>
            )}
          </div>
        </div>

        {/* Main Price Readout */}
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                ₹{priceData.modalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-[#a9bfa9] font-medium font-sans">
                / quintal (Modal)
              </span>
            </div>
            <p className="text-[11px] text-[#86a28b] mt-0.5">
              Range: ₹{priceData.minPrice.toLocaleString('en-IN')} – ₹{priceData.maxPrice.toLocaleString('en-IN')} / q ({priceData.market})
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#a9bfa9] block">
              Updated: {priceData.updatedAt}
            </span>
            <span className="text-[9px] text-[#86a28b] truncate max-w-[200px] block">
              Source: {priceData.source.split('(')[0]}
            </span>
          </div>
        </div>

        {/* Informational Modal / Accordion for Statutory MSP distinction */}
        {showInfo && (
          <div className="mt-3 pt-3 border-t border-[#1b3d26] text-[11px] text-[#d1e0d2] space-y-1.5 bg-[#122e1d] p-3 rounded-xl">
            <div className="font-bold text-[#f2c14e] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Official Government Pricing Policy Notice</span>
            </div>
            <p className="leading-relaxed">
              <strong>Statutory MSP:</strong> The Government of India / CACP fixes statutory MSP for 22 mandated agricultural crops, but <em>does not declare a statutory MSP for onions</em> (perishable horticultural produce).
            </p>
            <p className="leading-relaxed">
              <strong>Market Benchmarks:</strong> Procurements by NAFED / NCCF under the Price Stabilisation Fund and mandi transactions are governed by the <strong>APMC Mandi Modal Price</strong> at primary agricultural markets such as Lasalgaon APMC, Nashik.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
