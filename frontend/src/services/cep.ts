interface CEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export async function searchCEP(cep: string): Promise<CEPResponse | null> {
  try {
    // Remove caracteres não numéricos
    const cleanedCEP = cep.replace(/\D/g, '');
    
    // Verifica se o CEP tem 8 dígitos
    if (cleanedCEP.length !== 8) {
      return null;
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`);
    const data: CEPResponse = await response.json();

    // Se a API retornar erro, retorna null
    if (data.erro) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao consultar CEP:', error);
    return null;
  }
} 