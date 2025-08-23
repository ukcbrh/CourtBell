"use client";

import { useState } from 'react';
import { useClients } from '@/hooks/use-cases';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, User, Trash2, Edit, X, Check } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const [newClientName, setNewClientName] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { toast } = useToast();

  type Client = NonNullable<typeof editingClient>;

  const handleAddClient = () => {
    if (newClientName.trim()) {
      addClient({ name: newClientName.trim(), address: newClientAddress.trim(), phone: newClientPhone.trim() });
      setNewClientName('');
      setNewClientAddress('');
      setNewClientPhone('');
      toast({ title: 'Client Added', description: `Client "${newClientName.trim()}" has been added.` });
    } else {
        toast({ title: 'Error', description: 'Client name is required.', variant: 'destructive'});
    }
  };

  const handleUpdateClient = () => {
    if (editingClient && editingClient.name.trim()) {
      updateClient(editingClient);
      setEditingClient(null);
      toast({ title: 'Client Updated', description: `Client "${editingClient.name.trim()}" has been updated.` });
    }
  };
  
  const startEditing = (client: Client) => {
    setEditingClient({...client});
  }

  const onEditChange = (field: keyof Client, value: string) => {
    if (editingClient) {
        setEditingClient({...editingClient, [field]: value});
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Client</CardTitle>
          <CardDescription>Add a new client to associate with cases.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              placeholder="Client Name"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
            />
            <Input
              placeholder="Client Address (Optional)"
              value={newClientAddress}
              onChange={(e) => setNewClientAddress(e.target.value)}
            />
            <Input
              placeholder="Client Phone (e.g. 91...)"
              value={newClientPhone}
              onChange={(e) => setNewClientPhone(e.target.value)}
            />
          </div>
          <Button onClick={handleAddClient}>
            <PlusCircle className="mr-2" /> Add Client
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clients.length > 0 ? clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                {editingClient?.id === client.id ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-grow">
                    <Input value={editingClient.name} onChange={e => onEditChange('name', e.target.value)} className="h-9"/>
                    <Input value={editingClient.address} onChange={e => onEditChange('address', e.target.value)} className="h-9"/>
                    <Input value={editingClient.phone} onChange={e => onEditChange('phone', e.target.value)} className="h-9"/>
                  </div>
                ) : (
                  <div className="flex-grow">
                    <p className="font-semibold">{client.name}</p>
                    <div className="text-sm text-muted-foreground space-x-4">
                        {client.address && <span>{client.address}</span>}
                        {client.phone && <span>{client.phone}</span>}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 ml-4">
                  {editingClient?.id === client.id ? (
                    <>
                      <Button size="icon" variant="ghost" onClick={handleUpdateClient}><Check className="text-green-600"/></Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingClient(null)}><X className="text-gray-600"/></Button>
                    </>
                  ) : (
                    <Button size="icon" variant="ghost" onClick={() => startEditing(client)}><Edit /></Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost"><Trash2 className="text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the client "{client.name}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteClient(client.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )) : (
              <p className="text-muted-foreground text-center py-4">No clients added yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
