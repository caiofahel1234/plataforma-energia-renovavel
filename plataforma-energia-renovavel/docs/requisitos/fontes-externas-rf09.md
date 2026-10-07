# RF09 — Fontes externas oficiais

## IBGE
- API de localidades: `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/{codigo}`
- API SIDRA: `https://servicodados.ibge.gov.br/api/docs/`
- Portal de APIs do IBGE: `https://www.ibge.gov.br/api`

O backend usa o código IBGE de 7 dígitos para consultar o município e tenta obter população pelo SIDRA. Falhas na consulta opcional de população não impedem a identificação do município.

## ANEEL
- Portal de Dados Abertos: `https://dadosabertos.aneel.gov.br/`
- Conjunto de geração distribuída: `https://dadosabertos.aneel.gov.br/dataset/relacao-de-empreendimentos-de-geracao-distribuida`
- API CKAN/DataStore: `https://dadosabertos.aneel.gov.br/api/action/datastore_search`

A implementação descobre o recurso ativo pelo catálogo CKAN e consulta os registros por `CodMunicipioIbge`. A agregação considera UFV como solar e UFV/EOL/PCH/CGH/CGU como fontes renováveis.

### Limite importante
O RF09 do roteiro pede importação de dados externos IBGE/ANEEL. A implementação não inventa dados quando a fonte externa está indisponível: retorna erro 502. O critério C4 (tarifa média) possui conjunto oficial próprio da ANEEL, mas exige uma regra de associação município → distribuidora que não está definida no roteiro; por isso não é preenchido automaticamente por esta rota.
