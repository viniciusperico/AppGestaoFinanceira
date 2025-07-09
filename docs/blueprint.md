# **App Name**: Controle de Gastos Simples

## Core Features:

- Autenticação: Implementar login e registro usando o Firebase Authentication para permitir que os usuários acessem suas informações financeiras com segurança. Os dados só estarão acessíveis se o usuário estiver logado.
- Entrada de Registro: Permitir que os usuários adicionem entradas de receita ou despesa, incluindo os campos de dados: Descrição, valor, tipo, categoria, data, se é recorrente ou dividido.
- Filtro: Permitir filtragem por categoria, tipo e hora.
- Exportar: Permitir que os usuários exportem seus registros financeiros para compartilhar ou integrar com outras plataformas, para que possam revisar fora do aplicativo web.
- Adicionar registro: Implementar a criação de novos registros financeiros.
- Painel: Um painel personalizado que pode apresentar gráficos com categorias ou outras estatísticas úteis usando a biblioteca Chart.js
- IA de categorização de registro: Uma ferramenta que usa uma descrição fornecida pelo usuário e gera a categoria do registro.

## Style Guidelines:

- Cor primária: Azul claro (#A7D1AB), evoca uma sensação de confiança, segurança e clareza financeira. Este tom claro é limpo e moderno.
- Cor de fundo: Cinza muito claro (#f0f0f0) que é quase branco para fornecer uma base neutra e limpa que mantém a atenção nos dados sem causar cansaço visual.
- Cor de destaque: Verde claro (#90EE90), isso fornece contraste com o azul claro, oferecendo uma sensação refrescante, mas discreta, que destaca as ações principais sem sobrecarregar a interface do usuário.
- Fonte do corpo e do título: 'Inter', sans-serif. Uma fonte escolhida para máxima legibilidade em todos os tamanhos de tela, com ênfase no suporte a uma ampla gama de caracteres e idiomas, tornando-a adequada para cabeçalhos e descrições detalhadas de transações.
- Ícones de categoria: Utilize um conjunto de ícones minimalistas, em estilo de linha, para cada categoria de gastos para auxiliar no reconhecimento rápido e aprimorar o apelo visual do painel. Os ícones devem ser consistentes em estilo e facilmente distinguíveis.
- Animações de transição: Implemente efeitos de transição sutis ao navegar entre as seções do painel ou quando os dados são atualizados. As animações devem ser suaves e curtas para evitar atrasos e fornecer feedback sobre as interações do usuário.
- Cartões do painel: Use cartões bem espaçados para organizar informações financeiras, como totais de receita e despesas. Estes devem suportar filtragem.