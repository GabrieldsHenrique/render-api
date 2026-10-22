-- DropForeignKey
ALTER TABLE "orcamento_metas" DROP CONSTRAINT "orcamento_metas_meta_id_fkey";

-- DropForeignKey
ALTER TABLE "orcamento_metas" DROP CONSTRAINT "orcamento_metas_orcamento_id_fkey";

-- DropTable
DROP TABLE "orcamento_metas";
