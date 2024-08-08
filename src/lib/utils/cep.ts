export function getEnderecoFromCEP(cep) {
	return fetch(`https://viacep.com.br/ws/${cep}/json/`)
		.then((res) => res.json())
		.then((data) => {
			if (data.erro) {
				return null;
			}
			return data;
		});
}