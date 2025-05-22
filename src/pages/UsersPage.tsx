
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit, Trash2, UserCheck, UserX, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { userService, UserProfile } from '@/services/userService';

const UsersPage = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar usuários",
          description: "Não foi possível obter a lista de usuários.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [toast]);
  
  // Filter users by search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  );
  
  // Handle new user creation
  const handleAddUser = async () => {
    try {
      console.log('Adicionando novo usuário:', newUser);
      
      if (!newUser.name || !newUser.email || !newUser.password) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios.",
        });
        return;
      }
      
      setSubmitting(true);
      
      const result = await userService.createUser(
        newUser.name,
        newUser.email,
        newUser.password,
        newUser.role
      );
      
      if (result) {
        toast({
          title: "Usuário adicionado",
          description: "O novo usuário foi criado com sucesso.",
        });
        
        // Add new user to the list or refresh the list
        setUsers(prev => [result, ...prev]);
        setShowAddUserDialog(false);
        setNewUser({ name: '', email: '', password: '', role: 'user' });
      }
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar usuário",
        description: "Não foi possível criar o novo usuário.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle user status toggle
  const handleToggleUserStatus = async (user: UserProfile) => {
    try {
      const newStatus = !user.active;
      const result = await userService.toggleUserStatus(user.id, newStatus);
      
      if (result) {
        toast({
          title: newStatus ? "Usuário ativado" : "Usuário desativado",
          description: `${user.name} foi ${newStatus ? 'ativado' : 'desativado'} com sucesso.`,
        });
        
        // Update user in the list
        setUsers(prev => 
          prev.map(u => u.id === user.id ? { ...u, active: newStatus } : u)
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do usuário.",
      });
    }
  };
  
  // Handle user deletion
  const handleDeleteUser = async (id: string, name: string) => {
    try {
      if (window.confirm(`Tem certeza que deseja excluir o usuário ${name}?`)) {
        const success = await userService.deleteUser(id);
        
        if (success) {
          toast({
            title: "Usuário excluído",
            description: `${name} foi excluído com sucesso.`,
          });
          
          // Remove user from the list
          setUsers(prev => prev.filter(user => user.id !== id));
        }
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir usuário",
        description: "Não foi possível excluir o usuário.",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerenciamento de usuários e permissões
          </p>
        </div>
        <Button 
          className="mt-4 sm:mt-0"
          onClick={() => setShowAddUserDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Usuários do Sistema</CardTitle>
            <CardDescription>
              {loading ? 'Carregando usuários...' : `Total de ${filteredUsers.length} usuários encontrados`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou função"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Users Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Permissões</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          Carregando usuários...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8B5CF6&color=fff`} alt={user.name} />
                              <AvatarFallback>
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {user.active !== false ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <UserCheck className="mr-1 h-3 w-3" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              <UserX className="mr-1 h-3 w-3" />
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <div className="group relative">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-primary text-white text-xs px-2 py-1 rounded">
                                Dashboard
                              </span>
                            </div>
                            <div className="group relative">
                              {user.role === 'admin' || user.permissions?.pos ? (
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-muted"></div>
                              )}
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-primary text-white text-xs px-2 py-1 rounded">
                                PDV
                              </span>
                            </div>
                            <div className="group relative">
                              {user.role === 'admin' || user.permissions?.sales ? (
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-muted"></div>
                              )}
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-primary text-white text-xs px-2 py-1 rounded">
                                Vendas
                              </span>
                            </div>
                            <div className="group relative">
                              {user.role === 'admin' || user.permissions?.products ? (
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-muted"></div>
                              )}
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-primary text-white text-xs px-2 py-1 rounded">
                                Produtos
                              </span>
                            </div>
                            <div className="group relative">
                              {user.role === 'admin' || user.permissions?.reports ? (
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-muted"></div>
                              )}
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-primary text-white text-xs px-2 py-1 rounded">
                                Relatórios
                              </span>
                            </div>
                            <div className="group relative">
                              {user.role === 'admin' ? (
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-muted"></div>
                              )}
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-primary text-white text-xs px-2 py-1 rounded">
                                Usuários
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Switch
                              checked={user.active === true}
                              onCheckedChange={() => handleToggleUserStatus(user)}
                              aria-label={`${user.active ? 'Desativar' : 'Ativar'} ${user.name}`}
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <span className="sr-only">Abrir menu</span>
                                  <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 15 15"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                  >
                                    <path
                                      d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z"
                                      fill="currentColor"
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Opções</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => {
                                    toast({
                                      title: "Editar usuário",
                                      description: `Editando ${user.name}`,
                                    });
                                    // Implementação futura
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Badge variant="outline" className="mr-2 h-4 w-4 p-0 flex items-center justify-center">
                                    P
                                  </Badge>
                                  Permissões
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.active !== false ? (
                                  <DropdownMenuItem
                                    onClick={() => handleToggleUserStatus(user)}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Desativar
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleToggleUserStatus(user)}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Ativar
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDeleteUser(user.id, user.name)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados para adicionar um novo usuário ao sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                className="col-span-3"
                placeholder="Nome completo"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="col-span-3"
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                className="col-span-3"
                placeholder="Senha segura"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Função
              </Label>
              <select
                id="role"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
                <option value="manager">Gerente</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddUserDialog(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddUser}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>Adicionar Usuário</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
