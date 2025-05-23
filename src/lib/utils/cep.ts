export function getEnderecoFromCEP(cep:string) {
	return fetch(`https://viacep.com.br/ws/${cep}/json/`)
		.then((res) => res.json())
		.then((data) => {
			if (data.erro) {
				return null;
			}
			return data;
		});
}

export const estadosBrasileiros = [
	{ uf: 'AC', nome: 'Acre' },
	{ uf: 'AL', nome: 'Alagoas' },
	{ uf: 'AP', nome: 'Amapá' },
	{ uf: 'AM', nome: 'Amazonas' },
	{ uf: 'BA', nome: 'Bahia' },
	{ uf: 'CE', nome: 'Ceará' },
	{ uf: 'DF', nome: 'Distrito Federal' },
	{ uf: 'ES', nome: 'Espirito Santo' },
	{ uf: 'GO', nome: 'Goiás' },
	{ uf: 'MA', nome: 'Maranhão' },
	{ uf: 'MS', nome: 'Mato Grosso do Sul' },
	{ uf: 'MT', nome: 'Mato Grosso' },
	{ uf: 'MG', nome: 'Minas Gerais' },
	{ uf: 'PA', nome: 'Pará' },
	{ uf: 'PB', nome: 'Paraíba' },
	{ uf: 'PR', nome: 'Paraná' },
	{ uf: 'PE', nome: 'Pernambuco' },
	{ uf: 'PI', nome: 'Piauí' },
	{ uf: 'RJ', nome: 'Rio de Janeiro' },
	{ uf: 'RN', nome: 'Rio Grande do Norte' },
	{ uf: 'RS', nome: 'Rio Grande do Sul' },
	{ uf: 'RO', nome: 'Rondônia' },
	{ uf: 'RR', nome: 'Roraima' },
	{ uf: 'SC', nome: 'Santa Catarina' },
	{ uf: 'SP', nome: 'São Paulo' },
	{ uf: 'SE', nome: 'Sergipe' },
	{ uf: 'TO', nome: 'Tocantins' }
]