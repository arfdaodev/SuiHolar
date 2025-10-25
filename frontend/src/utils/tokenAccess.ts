// Token holder erişim kontrolü ve yönetimi

export interface TokenBalance {
  tokenName: string;
  symbol: string;
  amount: number;
  type: 'governance' | 'article';
  contractAddress?: string;
  transactionDigest?: string;
}

export interface AccessRequirement {
  tokenName: string;
  minimumAmount: number;
  tokenType: 'governance' | 'article';
}

// Kullanıcının token bakiyelerini localStorage'dan getir
export function getUserTokenBalances(userAddress: string): TokenBalance[] {
  try {
    const savedTokens = JSON.parse(localStorage.getItem('sui_wallet_tokens') || '[]');
    return savedTokens.filter((token: any) => token.owner === userAddress);
  } catch (error) {
    console.error('Token bakiyeleri alınamadı:', error);
    return [];
  }
}

// Belirli bir token'dan kullanıcının ne kadarı olduğunu kontrol et
export function getTokenBalance(
  userAddress: string, 
  tokenName: string, 
  tokenType?: 'governance' | 'article'
): number {
  const userTokens = getUserTokenBalances(userAddress);
  
  const matchingTokens = userTokens.filter(token => {
    const nameMatch = token.name === tokenName || token.symbol === tokenName;
    const typeMatch = !tokenType || token.type === tokenType;
    return nameMatch && typeMatch;
  });
  
  return matchingTokens.reduce((total, token) => total + token.amount, 0);
}

// Kullanıcının erişim yetkisi olup olmadığını kontrol et
export function checkAccessPermission(
  userAddress: string,
  requirements: AccessRequirement[]
): {
  hasAccess: boolean;
  missingTokens: AccessRequirement[];
  ownedTokens: TokenBalance[];
} {
  const ownedTokens = getUserTokenBalances(userAddress);
  const missingTokens: AccessRequirement[] = [];
  
  for (const requirement of requirements) {
    const balance = getTokenBalance(
      userAddress, 
      requirement.tokenName, 
      requirement.tokenType
    );
    
    if (balance < requirement.minimumAmount) {
      missingTokens.push({
        ...requirement,
        minimumAmount: requirement.minimumAmount - balance
      });
    }
  }
  
  return {
    hasAccess: missingTokens.length === 0,
    missingTokens,
    ownedTokens
  };
}

// PAPER token holder olup olmadığını kontrol et
export function isPaperTokenHolder(
  userAddress: string,
  projectId: string,
  minimumAmount: number = 1
): {
  hasAccess: boolean;
  balance: number;
  requiredAmount: number;
} {
  // Projeye ait PAPER token'ı bul
  const savedProjects = JSON.parse(localStorage.getItem('suiholar_projects') || '[]');
  const project = savedProjects.find((p: any) => p.id === projectId);
  
  if (!project) {
    return {
      hasAccess: false,
      balance: 0,
      requiredAmount: minimumAmount
    };
  }
  
  const paperTokenName = project.governanceTokenName;
  const balance = getTokenBalance(userAddress, paperTokenName, 'governance');
  
  return {
    hasAccess: balance >= minimumAmount,
    balance,
    requiredAmount: minimumAmount
  };
}

// Token transfer fonksiyonu (simulated - gerçek blockchain transfer için extend edilebilir)
export async function transferTokens(
  fromAddress: string,
  toAddress: string,
  tokenName: string,
  amount: number,
  tokenType: 'governance' | 'article'
): Promise<{
  success: boolean;
  transactionHash?: string;
  error?: string;
}> {
  try {
    // Gönderen adresin yeterli bakiyesi var mı kontrol et
    const senderBalance = getTokenBalance(fromAddress, tokenName, tokenType);
    
    if (senderBalance < amount) {
      return {
        success: false,
        error: `Yetersiz ${tokenName} token bakiyesi. Mevcut: ${senderBalance}, Gerekli: ${amount}`
      };
    }
    
    // localStorage'dan token'ları getir
    const allTokens = JSON.parse(localStorage.getItem('sui_wallet_tokens') || '[]');
    
    // Gönderen adresin token'ını azalt
    const senderTokenIndex = allTokens.findIndex((token: any) => 
      token.owner === fromAddress && 
      (token.name === tokenName || token.symbol === tokenName) &&
      token.type === tokenType
    );
    
    if (senderTokenIndex !== -1) {
      allTokens[senderTokenIndex].amount -= amount;
      
      // Eğer bakiye 0'a düştüyse token'ı kaldır
      if (allTokens[senderTokenIndex].amount <= 0) {
        allTokens.splice(senderTokenIndex, 1);
      }
    }
    
    // Alıcı adrese token ekle veya mevcut token'ı artır
    const receiverTokenIndex = allTokens.findIndex((token: any) => 
      token.owner === toAddress && 
      (token.name === tokenName || token.symbol === tokenName) &&
      token.type === tokenType
    );
    
    if (receiverTokenIndex !== -1) {
      allTokens[receiverTokenIndex].amount += amount;
    } else {
      // Yeni token entry'si oluştur
      const senderToken = allTokens.find((token: any) => 
        (token.name === tokenName || token.symbol === tokenName) &&
        token.type === tokenType
      );
      
      if (senderToken) {
        allTokens.push({
          ...senderToken,
          id: 'TRANSFER_' + Date.now(),
          owner: toAddress,
          amount: amount,
          transactionDigest: 'LOCAL_TRANSFER_' + Date.now(),
          createdAt: Date.now()
        });
      }
    }
    
    // localStorage'ı güncelle
    localStorage.setItem('sui_wallet_tokens', JSON.stringify(allTokens));
    
    const transactionHash = 'LOCAL_TX_' + Date.now();
    console.log('✅ Token transfer başarılı:', {
      from: fromAddress,
      to: toAddress,
      token: tokenName,
      amount,
      transactionHash
    });
    
    return {
      success: true,
      transactionHash
    };
    
  } catch (error) {
    console.error('❌ Token transfer hatası:', error);
    return {
      success: false,
      error: `Transfer başarısız: ${error}`
    };
  }
}

// Token holder'ları listele
export function getTokenHolders(
  tokenName: string,
  tokenType?: 'governance' | 'article'
): Array<{
  address: string;
  balance: number;
  tokenInfo: TokenBalance;
}> {
  try {
    const allTokens = JSON.parse(localStorage.getItem('sui_wallet_tokens') || '[]');
    
    const holders = allTokens
      .filter((token: any) => {
        const nameMatch = token.name === tokenName || token.symbol === tokenName;
        const typeMatch = !tokenType || token.type === tokenType;
        return nameMatch && typeMatch && token.amount > 0;
      })
      .map((token: any) => ({
        address: token.owner,
        balance: token.amount,
        tokenInfo: token
      }));
    
    return holders;
  } catch (error) {
    console.error('Token holder listesi alınamadı:', error);
    return [];
  }
}

// Proje sahibi kontrolü
export function isProjectOwner(userAddress: string, projectId: string): boolean {
  try {
    const savedProjects = JSON.parse(localStorage.getItem('suiholar_projects') || '[]');
    const project = savedProjects.find((p: any) => p.id === projectId);
    return project?.owner === userAddress;
  } catch (error) {
    console.error('Proje sahipliği kontrol edilemedi:', error);
    return false;
  }
}

// Token utility fonksiyonları
export function formatTokenAmount(amount: number): string {
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1) + 'M';
  } else if (amount >= 1_000) {
    return (amount / 1_000).toFixed(1) + 'K';
  } else {
    return amount.toLocaleString();
  }
}

export function getTokenDisplayName(tokenName: string, tokenType: 'governance' | 'article'): string {
  if (tokenType === 'governance') {
    return `$PAPER${tokenName.toUpperCase()}`;
  } else {
    return tokenName.toUpperCase();
  }
}