package com.duelith.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

/**
 * Entidad que mapea la tabla partidos de Supabase (bracket de eliminacion directa).
 * siguiente_partido_id referencia a otro Partido: al ganar, el equipo avanza a ese partido.
 */
@Entity
@Table(name = "partidos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Partido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "torneo_id", nullable = false)
    private Torneo torneo;

    /** Ronda dentro del bracket: 1 = primera ronda, aumenta hacia la final. */
    @Column(nullable = false)
    private Integer ronda;

    @Column(name = "numero_partido", nullable = false)
    private Integer numeroPartido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipo1_id")
    private Equipo equipo1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipo2_id")
    private Equipo equipo2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ganador_id")
    private Equipo ganador;

    /** Siguiente partido del bracket al que avanza el ganador. */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "siguiente_partido_id")
    private Partido siguientePartido;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPartido estado;

    /** Fecha/hora programada o en la que se jugo/reporto el partido. */
    @Column(name = "fecha_hora")
    private OffsetDateTime fechaHora;

    /** Marcador reportado por el capitan, ej: "2-1". */
    @Column(length = 30)
    private String marcador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reportado_por")
    private Usuario reportadoPor;

    @Column(name = "creado_en")
    private OffsetDateTime creadoEn;
}
