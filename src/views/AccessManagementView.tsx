import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Search, 
  Filter, 
  Shield, 
  GraduationCap, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Copy, 
  Check, 
  X, 
  Key, 
  MoreVertical, 
  RefreshCw, 
  Mail, 
  ExternalLink,
  Plus,
  Minus,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { MemberUser, AccessLicenseConfig } from '../types';

interface AccessManagementViewProps {
  members: MemberUser[];
  licenseConfig: AccessLicenseConfig;
  onAddMember: (memberData: Omit<MemberUser, 'id' | 'joinedAt'>) => void;
  onRemoveMember: (memberId: string) => void;
  onUpdateMemberStatus: (memberId: string, status: 'active' | 'suspended' | 'pending') => void;
  onUpdateLicenseConfig?: (config: AccessLicenseConfig) => void;
  onOpenCommercial?: () => void;
}

export const AccessManagementView: React.FC<AccessManagementViewProps> = ({
  members,
  licenseConfig,
  onAddMember,
  onRemoveMember,
  onUpdateMemberStatus,
  onUpdateLicenseConfig,
  onOpenCommercial,
}) => {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'mentor' | 'aluno'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<MemberUser | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Member Form state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'aluno' | 'mentor' | 'admin'>('aluno');
  const [newMemberTargetExam, setNewMemberTargetExam] = useState('CNU Bloco 7');
  const [newMemberTargetCareer, setNewMemberTargetCareer] = useState('');
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  // Metrics
  const activeMembersCount = members.filter(m => m.status === 'active').length;
  const pendingMembersCount = members.filter(m => m.status === 'pending').length;
  const suspendedMembersCount = members.filter(m => m.status === 'suspended').length;
  const totalOccupied = members.length;
  const availableLicenses = Math.max(0, licenseConfig.totalLicenses - totalOccupied);
  const occupancyPercent = Math.min(100, Math.round((totalOccupied / licenseConfig.totalLicenses) * 100));

  // Trigger Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.targetCareer && member.targetCareer.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.targetExam && member.targetExam.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [members, searchTerm, statusFilter, roleFilter]);

  // Handle Add Member Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      showToast('Por favor, preencha o nome e o e-mail do usuário.');
      return;
    }

    if (totalOccupied >= licenseConfig.totalLicenses) {
      showToast('Limite de licenças atingido! Remova um membro ou aumente o saldo.');
      return;
    }

    onAddMember({
      name: newMemberName.trim(),
      email: newMemberEmail.trim().toLowerCase(),
      role: newMemberRole,
      status: 'active',
      targetExam: newMemberTargetExam,
      targetCareer: newMemberTargetCareer.trim() || (newMemberRole === 'mentor' ? 'Mentoria Pedagógica' : 'Carreira Pública'),
    });

    // Reset form
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('aluno');
    setNewMemberTargetCareer('');
    setIsAddModalOpen(false);

    showToast(`Membro "${newMemberName}" adicionado com sucesso!`);
  };

  // Handle Remove Member Confirmation
  const confirmRemove = () => {
    if (!memberToRemove) return;
    onRemoveMember(memberToRemove.id);
    showToast(`Usuário ${memberToRemove.name} removido. 1 licença foi liberada.`);
    setIsRemoveModalOpen(false);
    setMemberToRemove(null);
  };

  // Handle Copy Invite Link
  const handleCopyInvite = () => {
    const link = `https://concursoia.app/ativar-acesso?token=GRP-${Date.now().toString(36).toUpperCase()}`;
    navigator.clipboard?.writeText?.(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-fadeIn text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>Administração</span>
            <span aria-hidden="true">·</span>
            <span>Licenças & Membros</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600" />
            <span>Gestão de Acesso por Usuário</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Visualize e gerencie os membros ativos, convites enviados e o saldo de licenças da sua turma ou grupo.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Link de Convite</span>
            <span className="sm:hidden">Convite</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-98"
          >
            <UserPlus className="w-4 h-4" />
            <span>Adicionar Membro</span>
          </button>
        </div>
      </div>

      {/* Capacity & Licensing Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Licenças Contratadas
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {licenseConfig.totalLicenses}
            </span>
            <span className="text-xs text-slate-500 font-medium">contas totais</span>
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold block pt-0.5">
            {licenseConfig.planName}
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Membros Ativos
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
              {activeMembersCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">com acesso liberado</span>
          </div>
          <span className="text-[10px] text-slate-400 block pt-0.5">
            {suspendedMembersCount > 0 ? `${suspendedMembersCount} suspenso(s)` : 'Nenhum suspenso'}
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Convites Pendentes
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
              {pendingMembersCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">aguardando ativação</span>
          </div>
          <span className="text-[10px] text-slate-400 block pt-0.5">
            Links enviados por e-mail
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Vagas Disponíveis
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-mono">
              {availableLicenses}
            </span>
            <span className="text-xs text-slate-500 font-medium">licenças livres</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block pt-0.5">
            {availableLicenses > 0 ? 'Prontas para novos membros' : 'Capacidade máxima atingida'}
          </span>
        </div>
      </div>

      {/* Progress Bar of Occupancy */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1 flex-1">
          <div className="flex justify-between items-center text-slate-700 font-semibold">
            <span>Ocupação do Saldo de Licenças:</span>
            <span className="font-mono text-indigo-600">{totalOccupied} / {licenseConfig.totalLicenses} ocupadas ({occupancyPercent}%)</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                occupancyPercent >= 90 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        {onOpenCommercial && (
          <button
            onClick={onOpenCommercial}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold shrink-0 self-start sm:self-auto cursor-pointer flex items-center gap-1"
          >
            <span>Contratar mais licenças de usuários</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, e-mail, cargo alvo ou concurso..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <span className="text-[10px] text-slate-400 font-bold px-2 uppercase">Status:</span>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'active', label: 'Ativos' },
                { id: 'pending', label: 'Pendentes' },
                { id: 'suspended', label: 'Suspensos' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setStatusFilter(opt.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer text-xs ${
                    statusFilter === opt.id
                      ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <span className="text-[10px] text-slate-400 font-bold px-2 uppercase">Perfil:</span>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'aluno', label: 'Alunos' },
                { id: 'mentor', label: 'Mentores' },
                { id: 'admin', label: 'Admins' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setRoleFilter(opt.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer text-xs ${
                    roleFilter === opt.id
                      ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/80 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Membro / Usuário</th>
                <th className="py-3 px-4">Função</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Desempenho</th>
                <th className="py-3 px-4">Último Acesso</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Nenhum membro encontrado</p>
                    <p className="text-xs text-slate-400 mt-0.5">Tente ajustar os filtros ou adicione um novo usuário.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const isCurrentAdmin = member.role === 'admin';
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${member.avatarColor || 'bg-indigo-600'} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs`}>
                            {member.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate text-xs sm:text-sm">
                              {member.name}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {member.email}
                            </span>
                            {(member.targetCareer || member.targetExam) && (
                              <span className="inline-block mt-0.5 text-[10px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.2 rounded">
                                {member.targetExam ? `${member.targetExam} · ` : ''}{member.targetCareer}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {member.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-lg">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Administrador</span>
                          </span>
                        ) : member.role === 'mentor' ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2.5 py-1 rounded-lg">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Mentor</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span>Aluno</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {member.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Ativo</span>
                          </span>
                        ) : member.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pendente</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Suspenso</span>
                          </span>
                        )}
                      </td>

                      {/* Performance */}
                      <td className="py-3.5 px-4">
                        {member.questionsSolved && member.questionsSolved > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-600 font-semibold">{member.questionsSolved} questões</span>
                              <span className="font-bold text-indigo-600">{member.accuracyRate}% acertos</span>
                            </div>
                            <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-indigo-600 h-full rounded-full"
                                style={{ width: `${member.accuracyRate || 0}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Sem registros</span>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <div>{member.lastActiveAt}</div>
                        <div className="text-[10px] text-slate-400">Cadastrado: {member.joinedAt}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active / Suspend */}
                          {member.status === 'active' ? (
                            <button
                              onClick={() => onUpdateMemberStatus(member.id, 'suspended')}
                              disabled={isCurrentAdmin}
                              title={isCurrentAdmin ? 'Administrador principal não pode ser suspenso' : 'Suspender acesso do membro temporariamente'}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          ) : member.status === 'suspended' ? (
                            <button
                              onClick={() => onUpdateMemberStatus(member.id, 'active')}
                              title="Reativar acesso do membro"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => showToast(`Convite reenviado com sucesso para ${member.email}`)}
                              title="Reenviar e-mail de convite"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete / Remove Member */}
                          <button
                            onClick={() => {
                              setMemberToRemove(member);
                              setIsRemoveModalOpen(true);
                            }}
                            disabled={isCurrentAdmin}
                            title={isCurrentAdmin ? 'Você não pode remover o administrador principal' : 'Remover usuário e liberar 1 licença'}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Callout about Individual Accounts */}
      <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
        <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Privacidade e Individualidade dos Membros</span>
        </div>
        <p className="text-xs text-indigo-900 leading-relaxed">
          Cada membro adicionado possui login e senha próprios. O histórico de questões resolvidas, o Caderno de Erros (ciclos de 1, 7 e 30 dias), as redações corrigidas e as dúvidas com o Professor Max são <strong>100% individualizados</strong>. Ao remover um usuário, o acesso correspondente é revogado e a licença volta a ficar disponível para um novo membro da sua turma.
        </p>
      </div>

      {/* MODAL 1: ADICIONAR NOVO MEMBRO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Adicionar Novo Membro</h3>
                  <span className="text-xs text-slate-500">
                    Vagas disponíveis: <strong>{availableLicenses}</strong> de {licenseConfig.totalLicenses}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo: *
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Ex: Ana Clara Silva"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail para Acesso: *
                </label>
                <input
                  type="email"
                  required
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Ex: ana.silva@email.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  O usuário receberá o link para criar a senha inicial por este e-mail.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Perfil / Função:
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="aluno">Aluno / Concurseiro</option>
                    <option value="mentor">Mentor Pedagógico / Professor</option>
                    <option value="admin">Administrador do Grupo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Concurso Alvo:
                  </label>
                  <select
                    value={newMemberTargetExam}
                    onChange={(e) => setNewMemberTargetExam(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="CNU Bloco 7">CNU - Bloco 7</option>
                    <option value="Receita Federal">Receita Federal (Auditor/Analista)</option>
                    <option value="TRF / Tribunais">Tribunais Federais (TRF / TRT)</option>
                    <option value="Polícia Federal">Polícia Federal / PRF</option>
                    <option value="INSS 2026">INSS (Técnico / Analista)</option>
                    <option value="Carreiras Bancárias">Caixa / Banco do Brasil</option>
                    <option value="Geral">Área Geral / Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cargo Desejado (Opcional):
                </label>
                <input
                  type="text"
                  value={newMemberTargetCareer}
                  onChange={(e) => setNewMemberTargetCareer(e.target.value)}
                  placeholder="Ex: Auditor Fiscal, Analista Judiciário, Agente PF"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                <input
                  type="checkbox"
                  id="welcomeEmail"
                  checked={sendWelcomeEmail}
                  onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                  className="accent-indigo-600 rounded cursor-pointer"
                />
                <label htmlFor="welcomeEmail" className="cursor-pointer">
                  Enviar e-mail automático com instruções e credenciais de acesso
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Adicionar Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMAR REMOÇÃO */}
      {isRemoveModalOpen && memberToRemove && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Remover {memberToRemove.name}?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                O acesso deste membro será revogado imediatamente e seus dados pessoais serão desvinculados do grupo.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 text-left">
              ✓ <strong>1 licença de usuário será liberada</strong> no seu saldo de contas para ser atribuída a outro aluno ou membro.
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setIsRemoveModalOpen(false);
                  setMemberToRemove(null);
                }}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRemove}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Sim, Remover Membro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: COMPARTILHAR LINK DE CONVITE */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Link de Convite Rápido</h3>
                  <span className="text-xs text-slate-500">Compartilhe diretamente via WhatsApp ou E-mail</span>
                </div>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Qualquer aluno que acessar por este link poderá ativar uma das suas <strong>{availableLicenses} licenças disponíveis</strong> e criar sua conta pessoal na plataforma.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-700 truncate select-all">
                https://concursoia.app/ativar-acesso?token=GRP-2026-X89
              </span>
              <button
                onClick={handleCopyInvite}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <p>• O link expira assim que todas as vagas contratadas forem preenchidas.</p>
              <p>• Cada aluno terá seu próprio banco de erros e não verá as notas dos colegas.</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
