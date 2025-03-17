import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { YieldStrategy } from './ai';

export async function generatePDF(strategy: YieldStrategy, elementId: string): Promise<string> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Element not found');

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#0a0a0a',
    logging: false
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 20;

  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

  // Add metadata
  pdf.setProperties({
    title: 'DeFi Yield Strategy Report',
    subject: `${strategy.riskLevel} Risk Strategy - ${strategy.expectedYield} APY`,
    author: 'Smart Yield Optimizer AI',
    keywords: 'DeFi, Yield, Strategy, AI',
    creator: 'Smart Yield Optimizer'
  });

  // Save the PDF
  const pdfBlob = pdf.output('blob');
  return URL.createObjectURL(pdfBlob);
}

async function generateStrategyCard(strategy: YieldStrategy): Promise<string> {
  // Create a temporary div for the card
  const cardContainer = document.createElement('div');
  cardContainer.style.position = 'absolute';
  cardContainer.style.left = '-9999px';
  cardContainer.style.top = '-9999px';
  cardContainer.style.width = '1200px';
  cardContainer.style.height = '630px';
  cardContainer.style.padding = '40px';
  cardContainer.style.background = 'radial-gradient(circle at 50% 50%, rgba(0, 255, 157, 0.1), transparent 50%), radial-gradient(circle at 100% 0%, rgba(0, 184, 255, 0.1), transparent 50%)';
  cardContainer.style.backgroundColor = '#0a0a0a';
  cardContainer.style.color = 'white';
  cardContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';

  cardContainer.innerHTML = `
    <div style="height: 100%; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; backdrop-filter: blur(12px); background: rgba(17,25,40,0.75); padding: 40px; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
          <div style="width: 48px; height: 48px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#00ff9d" stroke-width="2" style="width: 100%; height: 100%;">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              <path d="M12 16a4 4 0 100-8 4 4 0 000 8z"/>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <h1 style="font-size: 36px; font-weight: bold; color: #00ff9d; text-shadow: 0 0 10px rgba(0,255,157,0.5);">Smart Yield Optimizer AI</h1>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px;">
          <div style="background: rgba(255,255,255,0.05); padding: 24px; border-radius: 12px;">
            <h3 style="font-size: 18px; color: #888; margin-bottom: 8px;">Expected Yield</h3>
            <p style="font-size: 32px; font-weight: bold; color: #00ff9d;">${strategy.expectedYield}</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 24px; border-radius: 12px;">
            <h3 style="font-size: 18px; color: #888; margin-bottom: 8px;">Risk Level</h3>
            <p style="font-size: 32px; font-weight: bold; color: #00b8ff;">${strategy.riskLevel.toUpperCase()}</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 24px; border-radius: 12px;">
            <h3 style="font-size: 18px; color: #888; margin-bottom: 8px;">Auto-Compound APY</h3>
            <p style="font-size: 32px; font-weight: bold; color: #ff00ff;">${strategy.autoCompounding.estimatedAPY}</p>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.05); padding: 24px; border-radius: 12px; margin-bottom: 32px;">
          <h3 style="font-size: 18px; color: #888; margin-bottom: 16px;">Strategy Overview</h3>
          <p style="font-size: 18px; color: #fff; line-height: 1.6;">${strategy.recommendation.split('\n')[0]}</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 16px;">
          <div style="background: rgba(255,255,255,0.05); padding: 12px 24px; border-radius: 8px;">
            <span style="color: #888;">Chains:</span>
            <span style="color: #fff; margin-left: 8px;">${strategy.chains.join(', ')}</span>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 12px 24px; border-radius: 8px;">
            <span style="color: #888;">Protocols:</span>
            <span style="color: #fff; margin-left: 8px;">${strategy.protocols.join(', ')}</span>
          </div>
        </div>
        <div style="font-size: 14px; color: #888;">Generated by Smart Yield Optimizer AI</div>
      </div>
    </div>
  `;

  document.body.appendChild(cardContainer);

  try {
    const canvas = await html2canvas(cardContainer, {
      scale: 1,
      backgroundColor: '#0a0a0a',
      logging: false,
      width: 1200,
      height: 630
    });

    const imageUrl = canvas.toDataURL('image/png');
    return imageUrl;
  } finally {
    document.body.removeChild(cardContainer);
  }
}

export async function shareOnTwitter(strategy: YieldStrategy): Promise<void> {
  try {
    const imageUrl = await generateStrategyCard(strategy);
    const blob = await (await fetch(imageUrl)).blob();
    const file = new File([blob], 'strategy-card.png', { type: 'image/png' });

    // Create a FormData object to handle the file upload
    const formData = new FormData();
    formData.append('media', file);

    // Get the first insight for market context
    const marketInsight = strategy.insights[0] || '';
    
    // Get the first line of the recommendation
    const recommendationSummary = strategy.recommendation.split('\n')[0];
    
    // Create a dynamic tweet text based on the current strategy
    const tweetText = `🤖 AI Yield Strategy Alert!\n\n💡 ${recommendationSummary}\n\n📊 ${strategy.expectedYield} APY (${strategy.riskLevel} risk)\n🔄 Auto-compound: ${strategy.autoCompounding.estimatedAPY}\n\n${marketInsight}\n\n#DeFi #YieldFarming #AI`;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, '_blank');
  } catch (error) {
    console.error('Error generating strategy card:', error);
  }
}