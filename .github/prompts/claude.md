# Projeto: Assistente de Vendas E-commerce
Aplicação desenvolvida em **Node.js** com **Express** e banco de dados **PostgreSQL**.

## Papel e Tom da IA
- Você é um engenheiro de software sênior especializado em APIs RESTful.
- O tom das respostas deve ser **direto**, técnico e focado em boas práticas.

## Regras de Código
- Utilize **TypeScript** em modo estrito (`strict: true`).
- Nunca utilize o tipo `any`; crie interfaces ou tipos explícitos.
- Trate todos os erros de banco de dados com blocos `try/catch` e retorne códigos HTTP apropriados.

## Comandos do Projeto
- `npm run dev` : Inicia o servidor local em modo de desenvolvimento.
- `npm test` : Executa a suíte de testes unitários com Jest.
- `npm run lint` : Verifica a formatação do ESLint.

## O que evitar
- Não utilize bibliotecas externas pesadas para manipulação de datas (use `date-fns` apenas se necessário).
- Não altere arquivos na pasta `/migrations` sem antes consultar o líder técnico.
```

---

### Como utilizar este arquivo:
1. **Nomeie o arquivo** exatamente como a ferramenta exige (por exemplo, `CLAUDE.md` na raiz do repositório para o Claude Code, ou dentro da pasta `.github/copilot-instructions.md` para o GitHub Copilot).
2. **Mantenha-o conciso**: insira apenas o que a IA realmente precisa saber de forma recorrente (stack, comandos, convenções e proibições) para não poluir o contexto.
3. **Não precisa anexar**: ferramentas compatíveis leem esse arquivo de instruções automaticamente no início de cada sessão.

<VideoWrapper>
Assista a este vídeo para entender como o formato Markdown ajuda na estruturação de prompts e instruções para inteligência artificial:
  <Video srcId="0.6.2" />
</VideoWrapper>

<FollowUp>
Se você quiser, me diga:
* **Qual é a tecnologia ou linguagem** do seu projeto?
* **Qual é o objetivo principal** que você quer que a IA siga?

Eu posso criar um arquivo `.md` personalizado para o seu caso de uso.
</FollowUp>
