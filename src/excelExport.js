import ExcelJS from 'exceljs';

export const exportToProfessionalExcel = async (products, stats) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HPE EOS Manager';
  workbook.created = new Date();

  // --- FEUILLE 1 : SYNTHÈSE ---
  const summarySheet = workbook.addWorksheet('Synthèse', {
    views: [{ showGridLines: false }]
  });

  // Titre
  summarySheet.mergeCells('B2:E3');
  const titleCell = summarySheet.getCell('B2');
  titleCell.value = 'Rapport de Fin de Vie (EOS) - HPE/Aruba';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0069B4' } }; // HPE Green/Teal or Blue
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Date
  summarySheet.mergeCells('B4:E4');
  const dateCell = summarySheet.getCell('B4');
  dateCell.value = `Généré le : ${new Date().toLocaleDateString('fr-FR')}`;
  dateCell.font = { italic: true, size: 10 };
  dateCell.alignment = { horizontal: 'right' };

  // KPIs
  const kpiStartRow = 6;
  
  const addKPI = (label, value, row, color) => {
      summarySheet.getCell(`B${row}`).value = label;
      summarySheet.getCell(`B${row}`).font = { bold: true };
      summarySheet.getCell(`C${row}`).value = value;
      summarySheet.getCell(`C${row}`).font = { size: 12, bold: true, color: { argb: color } };
      summarySheet.getCell(`C${row}`).alignment = { horizontal: 'left' };
  };

  addKPI('Total Produits :', stats.total, kpiStartRow, 'FF000000');
  addKPI('Catégories Uniques :', stats.categoriesCount, kpiStartRow + 1, 'FF000000');
  addKPI('Avec Remplacement :', stats.withReplacement, kpiStartRow + 2, 'FF008000'); // Green
  addKPI('Sans Remplacement :', stats.total - stats.withReplacement, kpiStartRow + 3, 'FFFF0000'); // Red

  // Tableau par année (petit tableau de synthèse)
  let row = kpiStartRow + 6;
  summarySheet.getCell(`B${row}`).value = "Distribution par Année de Fin de Vente";
  summarySheet.getCell(`B${row}`).font = { bold: true, size: 12, underline: true };
  
  row += 2;
  const headerYear = summarySheet.getCell(`B${row}`);
  headerYear.value = "Année";
  headerYear.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
  headerYear.font = { bold: true };
  headerYear.border = { bottom: {style:'thin'} };

  const headerCount = summarySheet.getCell(`C${row}`);
  headerCount.value = "Nombre";
  headerCount.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
  headerCount.font = { bold: true };
  headerCount.border = { bottom: {style:'thin'} };

  Object.entries(stats.byYear).sort().forEach(([year, count]) => {
      row++;
      summarySheet.getCell(`B${row}`).value = year;
      summarySheet.getCell(`C${row}`).value = count;
  });

  summarySheet.getColumn('B').width = 30;
  summarySheet.getColumn('C').width = 20;

  // --- FEUILLE 2 : CATALOGUE DÉTAILLÉ ---
  const dataSheet = workbook.addWorksheet('Catalogue Détail');
  
  // Colonnes
  dataSheet.columns = [
    { header: 'Catégorie', key: 'category', width: 40 },
    { header: 'Référence', key: 'productNumber', width: 20 },
    { header: 'Description', key: 'productDescription', width: 50 },
    { header: 'Réf. Remplacement', key: 'replacementProductNumber', width: 20 },
    { header: 'Desc. Remplacement', key: 'replacementProductDescription', width: 50 },
    { header: 'Fin de Vente', key: 'endOfSaleDate', width: 15 },
    { header: 'Notes', key: 'notes', width: 30 },
  ];

  // Ajouter les données
  dataSheet.addRows(products);

  // Création du Tableau Excel (Table) avec filtres et style
  const lastRow = products.length + 1; // +1 header
  dataSheet.addTable({
    name: 'TableauProduits',
    ref: 'A1',
    headerRow: true,
    totalsRow: false,
    style: {
      theme: 'TableStyleMedium2',
      showRowStripes: true,
    },
    columns: [
      { name: 'Catégorie', filterButton: true },
      { name: 'Référence', filterButton: true },
      { name: 'Description', filterButton: true },
      { name: 'Réf. Remplacement', filterButton: true },
      { name: 'Desc. Remplacement', filterButton: true },
      { name: 'Fin de Vente', filterButton: true },
      { name: 'Notes', filterButton: true },
    ],
    rows: products.map(p => [
        p.category, 
        p.productNumber, 
        p.productDescription, 
        p.replacementProductNumber, 
        p.replacementProductDescription, 
        p.endOfSaleDate, 
        p.notes
    ]),
  });

  // Mise en forme conditionnelle ou stylisation spécifique
  // Highlight rows without replacement
  dataSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
          const replacementCell = row.getCell('D'); // Replacement Number
          if (!replacementCell.value) {
              // Light Red background for empty replacement
              replacementCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEB' } };
          } else {
               // Light Green for present replacement
               replacementCell.font = { color: { argb: 'FF006400' }, bold: true };
          }
      }
  });

  // Headings Style (déjà géré par la Table mais on force l'alignement)
  dataSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Export
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `HPE_EOS_Rapport_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
