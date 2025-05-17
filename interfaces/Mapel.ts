export interface Mapel {
  id: string;
  nama_mata_pelajaran: string;
  programStudiId: string;
  programStudi: {
    nama_program_studi: string;
  };
}