"use client";

import { useState } from 'react';
import { useJuniors } from '@/hooks/use-cases';
import type { Junior } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, Edit, X, Check } from 'lucide-react';
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

export default function JuniorsPage() {
  const { juniors, addJunior, updateJunior, deleteJunior } = useJuniors();
  const [newJunior, setNewJunior] = useState<Omit<Junior, 'id'>>({ name: '' });
  const [editingJunior, setEditingJunior] = useState<Junior | null>(null);
  const { toast } = useToast();

  const handleAddJunior = () => {
    if (newJunior.name.trim()) {
      addJunior(newJunior);
      setNewJunior({ name: '', qualification: '', address: '', phone: '', whatsapp: '' });
      toast({ title: 'Junior Added', description: `Junior advocate "${newJunior.name.trim()}" has been added.` });
    } else {
        toast({ title: 'Error', description: 'Junior name is required.', variant: 'destructive'});
    }
  };

  const handleUpdateJunior = () => {
    if (editingJunior && editingJunior.name.trim()) {
      updateJunior(editingJunior);
      setEditingJunior(null);
      toast({ title: 'Junior Updated', description: `Junior advocate "${editingJunior.name.trim()}" has been updated.` });
    }
  };
  
  const startEditing = (junior: Junior) => {
    setEditingJunior({...junior});
  }

  const onEditChange = (field: keyof Junior, value: string) => {
    if (editingJunior) {
        setEditingJunior({...editingJunior, [field]: value});
    }
  }

  const onNewChange = (field: keyof Omit<Junior, 'id'>, value: string) => {
    setNewJunior(prev => ({...prev, [field]: value}));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Junior Advocate</CardTitle>
          <CardDescription>Add a junior to your team and assign them to cases.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input placeholder="Name*" value={newJunior.name} onChange={(e) => onNewChange('name', e.target.value)} />
            <Input placeholder="Qualification" value={newJunior.qualification} onChange={(e) => onNewChange('qualification', e.target.value)} />
            <Input placeholder="Address" value={newJunior.address} onChange={(e) => onNewChange('address', e.target.value)} />
            <Input placeholder="Phone" value={newJunior.phone} onChange={(e) => onNewChange('phone', e.target.value)} />
            <Input placeholder="WhatsApp Number" value={newJunior.whatsapp} onChange={(e) => onNewChange('whatsapp', e.target.value)} />
          </div>
          <Button onClick={handleAddJunior}>
            <PlusCircle className="mr-2" /> Add Junior
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Junior Advocates List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {juniors.length > 0 ? juniors.map((junior) => (
              <div key={junior.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                {editingJunior?.id === junior.id ? (
                   <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <Input value={editingJunior.name} onChange={e => onEditChange('name', e.target.value)} placeholder="Name*" />
                    <Input value={editingJunior.qualification} onChange={e => onEditChange('qualification', e.target.value)} placeholder="Qualification"/>
                    <Input value={editingJunior.address} onChange={e => onEditChange('address', e.target.value)} placeholder="Address" />
                    <Input value={editingJunior.phone} onChange={e => onEditChange('phone', e.target.value)} placeholder="Phone" />
                    <Input value={editingJunior.whatsapp} onChange={e => onEditChange('whatsapp', e.target.value)} placeholder="WhatsApp" />
                  </div>
                ) : (
                  <div className="flex-grow">
                    <p className="font-semibold">{junior.name}</p>
                    <div className="text-sm text-muted-foreground space-y-1 mt-1">
                        {junior.qualification && <p>Qualification: {junior.qualification}</p>}
                        {junior.address && <p>Address: {junior.address}</p>}
                        {junior.phone && <p>Phone: {junior.phone}</p>}
                        {junior.whatsapp && <p>WhatsApp: {junior.whatsapp}</p>}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 ml-4">
                  {editingJunior?.id === junior.id ? (
                    <>
                      <Button size="icon" variant="ghost" onClick={handleUpdateJunior}><Check className="text-green-600"/></Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingJunior(null)}><X className="text-gray-600"/></Button>
                    </>
                  ) : (
                    <Button size="icon" variant="ghost" onClick={() => startEditing(junior)}><Edit /></Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost"><Trash2 className="text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{junior.name}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteJunior(junior.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )) : (
              <p className="text-muted-foreground text-center py-4">No junior advocates added yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
